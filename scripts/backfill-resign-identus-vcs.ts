#!/usr/bin/env -S node --experimental-strip-types
/**
 * Re-issue legacy `IDENTUS_JWT` VCs as `INTERNAL_JWT` signed by the
 * production `KmsJwtSigner` (prd IDENTUS 撤去 backfill).
 *
 * Background
 * ----------
 * Before the DID/VC internalization (`docs/report/did-vc-internalization.md`)
 * VCs were issued through an external Identus agent and persisted with
 * `vc_format = 'IDENTUS_JWT'`. Phase 4 撤去 で Identus を廃止するにあたり、
 * 失効していない既存 IDENTUS VC を自前の KMS (Ed25519) 署名による
 * `INTERNAL_JWT` に再発行し直す必要がある。
 *
 * This is distinct from `resign-stub-vcs.ts`: that script targets Phase 1
 * `INTERNAL_JWT` rows whose signature segment is the `STUB_SIGNATURE`
 * marker. `IDENTUS_JWT` rows never carry that marker, so they are out of
 * scope there and need this dedicated backfill.
 *
 * What this script does
 * ---------------------
 *   1. `vc_format = 'IDENTUS_JWT'` AND `revoked_at IS NULL` の行を全件抽出。
 *   2. `vc_jwt` が NULL/空 の行（Identus 側で発行が完了しなかった行）は
 *      SKIP してログ出力する — 復元すべき発行済み VC が存在しないため。
 *   3. 残る行について:
 *        - subject DID  = `buildUserDid(userId)`
 *                         (`did:web:api.civicship.app:users:<userId>`)
 *          ※ User DID backfill が完了している前提。
 *        - claims       = `claims` JSON カラムをそのまま使用
 *          (legacy `VCIssuanceRequestConverter` が `EvaluationCredential`
 *           形で書き込んだ値が source of truth)。
 *        - issuanceDate = `completedAt ?? requestedAt ?? createdAt`
 *          (原本の発行時刻を保持し、再発行の瞬間で上書きしない)。
 *      を元に `buildVcPayload()` で W3C VC payload を組み立て、
 *      `KmsJwtSigner` で実 Ed25519 署名した JWT を生成する。
 *   4. 同一 row を in-place 更新する: `vc_format -> 'INTERNAL_JWT'`,
 *      `vc_jwt -> <new>`。`updated_at` は Prisma `@updatedAt` が自動更新。
 *      `revoked_at` は触らない（revoke ではなく置換）。
 *
 * Why in-place update (and not "revoke old + insert new")
 * -------------------------------------------------------
 * `t_vc_issuance_requests.evaluation_id` は `@unique`(NOT NULL) のため、
 * 同じ evaluation に対する 2 行目を INSERT できない。よって元 row を
 * revoke して新 row を作る方式は採れず、`resign-stub-vcs.ts` と同じく
 * 既存 row を直接書き換える。`credentialStatus`(StatusList) は付与しない
 * — `buildVcPayload` の replay/legacy パス（`credentialStatus` 省略可）
 * に合わせ、IDENTUS row が持つ statusList 関連カラムはそのまま残す。
 *
 * `--confirm` 無しは dry-run（対象件数・SKIP 件数のみ表示、KMS 署名や
 * DB 書き込みは行わない）。
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §16     (Phase 2 KMS swap)
 *   docs/report/did-vc-internalization.md §5.2.2  (VC issuance / JWT shape)
 *   docs/report/did-vc-internalization.md §B      (issuer / subject DID)
 *
 * 実行例 (dev):
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/backfill-resign-identus-vcs.ts
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/backfill-resign-identus-vcs.ts --confirm
 *
 * Exit codes: 0 = OK (dry-run or all rows resigned), 1 = error.
 */

import "reflect-metadata";
import "@/application/provider";

import { container } from "tsyringe";
import { VcFormat } from "@prisma/client";

import { prismaClient } from "@/infrastructure/prisma/client";
import type { JwtSigner } from "@/application/domain/credential/shared/jwtSigner";
import { CIVICSHIP_ISSUER_DID } from "@/application/domain/credential/shared/constants";
import { buildVcPayload } from "@/application/domain/credential/vcIssuance/service";
import { buildUserDid } from "@/infrastructure/libs/did/userDidBuilder";

interface Flags {
  confirm: boolean;
  limit?: number;
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { confirm: false };
  for (const arg of argv) {
    if (arg === "--confirm") {
      flags.confirm = true;
      continue;
    }
    const limitMatch = /^--limit=(\d+)$/.exec(arg);
    if (limitMatch) {
      flags.limit = Number.parseInt(limitMatch[1], 10);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }
  return flags;
}

function base64urlEncodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

/**
 * The legacy `VCIssuanceRequestConverter` always writes `claims` as a JSON
 * object, but defend against NULL / array / scalar rows so a single corrupt
 * row fails loudly for that id instead of producing a malformed VC payload.
 */
function asClaimsObject(claims: unknown): Record<string, unknown> {
  if (claims === null || typeof claims !== "object" || Array.isArray(claims)) {
    throw new Error(`claims is not a JSON object (got ${claims === null ? "null" : Array.isArray(claims) ? "array" : typeof claims})`);
  }
  return claims as Record<string, unknown>;
}

/** Build the new INTERNAL_JWT (header.payload.signature) for one row. */
async function buildInternalJwt(
  row: {
    userId: string;
    claims: unknown;
    issuedAt: Date;
  },
  signer: JwtSigner,
): Promise<string> {
  const subjectDid = buildUserDid(row.userId);
  const payload = buildVcPayload({
    issuer: CIVICSHIP_ISSUER_DID,
    subject: subjectDid,
    claims: asClaimsObject(row.claims),
    issuedAt: row.issuedAt,
  });

  // Mirror `VcIssuanceService.issueVc`: refresh the signer snapshot, then
  // read `alg` / `kid` synchronously for the header before signing.
  await signer.prepare();
  const headerB64u = base64urlEncodeJson({
    alg: signer.alg,
    typ: "JWT",
    kid: signer.kid,
  });
  const payloadB64u = base64urlEncodeJson(payload);
  const signingInput = `${headerB64u}.${payloadB64u}`;
  const signature = await signer.sign(signingInput);
  return `${signingInput}.${signature}`;
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2));
  process.stdout.write("Re-issue IDENTUS_JWT VCs as KMS-signed INTERNAL_JWT\n\n");
  process.stdout.write(`mode: ${flags.confirm ? "EXECUTE" : "DRY-RUN"}\n`);
  if (flags.limit !== undefined) process.stdout.write(`limit: ${flags.limit}\n`);
  process.stdout.write("\n");

  const candidates = await prismaClient.vcIssuanceRequest.findMany({
    where: {
      vcFormat: VcFormat.IDENTUS_JWT,
      revokedAt: null,
    },
    select: {
      id: true,
      userId: true,
      claims: true,
      vcJwt: true,
      createdAt: true,
      requestedAt: true,
      completedAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: flags.limit,
  });

  process.stdout.write(
    `Found ${candidates.length} IDENTUS_JWT VC row(s) with revokedAt IS NULL\n\n`,
  );
  if (candidates.length === 0) {
    return 0;
  }

  // Sanity-check the signer once before iterating so a misconfigured KMS /
  // missing active-key row fails loudly before touching any row. `prepare()`
  // only resolves the active key (a cheap DB lookup) — no KMS sign call.
  const signer = container.resolve<JwtSigner>("VcJwtSigner");
  await signer.prepare();
  process.stdout.write(`signer: alg=${signer.alg}, kid=${signer.kid}\n\n`);

  let resigned = 0;
  let skipped = 0;
  let failed = 0;
  for (const row of candidates) {
    try {
      if (!row.vcJwt || row.vcJwt.length === 0) {
        // Identus 側で発行が完了しなかった行 — 復元すべき発行済み VC が
        // 無いので対象外。revoke もしない（既存挙動を変えない）。
        skipped += 1;
        process.stdout.write(`SKIP  ${row.id}: vcJwt is empty (IDENTUS issuance never completed)\n`);
        continue;
      }

      const issuedAt = row.completedAt ?? row.requestedAt ?? row.createdAt;
      const subjectDid = buildUserDid(row.userId);

      if (flags.confirm) {
        const newJwt = await buildInternalJwt({ userId: row.userId, claims: row.claims, issuedAt }, signer);
        await prismaClient.vcIssuanceRequest.update({
          where: { id: row.id },
          data: {
            vcFormat: VcFormat.INTERNAL_JWT,
            vcJwt: newJwt,
          },
        });
        resigned += 1;
        process.stdout.write(`OK    ${row.id}: reissued INTERNAL_JWT (subject=${subjectDid}, new len=${newJwt.length})\n`);
      } else {
        // dry-run: 件数のみ。KMS 署名・DB 書き込みは行わない。subject DID
        // と claims 形状の検証だけ実施し、不正な行は failed として顕在化。
        asClaimsObject(row.claims);
        resigned += 1;
        process.stdout.write(`DRY   ${row.id}: would reissue INTERNAL_JWT (subject=${subjectDid})\n`);
      }
    } catch (err) {
      failed += 1;
      process.stderr.write(
        `FAIL  ${row.id}: ${err instanceof Error ? err.message : String(err)}\n`,
      );
    }
  }

  process.stdout.write(
    `\n${flags.confirm ? "reissued" : "would-reissue"}: ${resigned}, skipped (empty vcJwt): ${skipped}, failed: ${failed}\n`,
  );
  if (!flags.confirm) {
    process.stdout.write("\nRe-run with `--confirm` to apply.\n");
  }
  return failed === 0 ? 0 : 1;
}

main()
  .then((code) => {
    prismaClient.$disconnect().finally(() => process.exit(code));
  })
  .catch((err: unknown) => {
    process.stderr.write(`ERROR: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`);
    prismaClient.$disconnect().finally(() => process.exit(1));
  });
