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
 * scope there and need this dedicated backfill. The shared CLI plumbing
 * (`--confirm` / `--limit`, JWT signing, teardown) lives in
 * `scripts/lib/resignVcCli.ts`.
 *
 * What this script does
 * ---------------------
 *   1. `vc_format = 'IDENTUS_JWT'` AND `status = 'COMPLETED'` AND
 *      `revoked_at IS NULL` の行を全件抽出。
 *      `status = 'COMPLETED'` で絞るのは「発行が成功した行」だけを再発行
 *      対象にするため — prd の IDENTUS_JWT 行は発行成功済みでも `vc_jwt`
 *      が NULL のまま `claims` のみに VC 内容が残っているケースがある。
 *      status が PENDING / PROCESSING / FAILED の行は発行が完了して
 *      おらず復元すべき VC が存在しないため対象外（再発行しない）。
 *   2. 各行について (`vc_jwt` が NULL/空 かどうかに依らず):
 *        - subject DID  = `buildUserDid(userId)`
 *                         (`did:web:api.civicship.app:users:<userId>`)
 *          ※ User DID backfill が完了している前提。
 *        - claims       = `claims` JSON カラムをそのまま使用
 *          (legacy `VCIssuanceRequestConverter` が `EvaluationCredential`
 *           形で書き込んだ値が source of truth)。COMPLETED の IDENTUS_JWT
 *           行は `vc_jwt` が NULL でも `claims` に VC 内容が残っているため、
 *           `vc_jwt` の有無に関わらず `claims` から復元して再発行する。
 *        - issuanceDate = `completedAt ?? requestedAt ?? createdAt`
 *          (原本の発行時刻を保持し、再発行の瞬間で上書きしない)。
 *      を元に `buildVcPayload()` で W3C VC payload を組み立て、
 *      `KmsJwtSigner` で実 Ed25519 署名した JWT を生成する。
 *   3. 同一 row を in-place 更新する: `vc_format -> 'INTERNAL_JWT'`,
 *      `vc_jwt -> <new>`。`updated_at` は Prisma `@updatedAt` が自動更新。
 *      `revoked_at` は触らない（revoke ではなく置換）。
 *
 *   `claims` が NULL / 非オブジェクト で復元元が無い行は `asClaimsObject`
 *   が loud に失敗し、`failed` として顕在化する（暗黙 SKIP はしない）。
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
 * `--confirm` 無しは dry-run（対象件数のみ表示、KMS 署名や
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
import { VcFormat, VcIssuanceStatus } from "@prisma/client";

import { prismaClient } from "@/infrastructure/prisma/client";
import type { JwtSigner } from "@/application/domain/credential/shared/jwtSigner";
import { CIVICSHIP_ISSUER_DID } from "@/application/domain/credential/shared/constants";
import { buildVcPayload } from "@/application/domain/credential/vcIssuance/service";
import { buildUserDid } from "@/infrastructure/libs/did/userDidBuilder";
import {
  base64urlEncodeJson,
  parseResignCliFlags,
  runResignScript,
  signJwt,
} from "./lib/resignVcCli.ts";

/** Human-readable kind of a non-object JSON value, for error messages. */
function describeJsonKind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * The legacy `VCIssuanceRequestConverter` always writes `claims` as a JSON
 * object, but defend against NULL / array / scalar rows so a single corrupt
 * row fails loudly for that id instead of producing a malformed VC payload.
 */
function asClaimsObject(claims: unknown): Record<string, unknown> {
  if (claims === null || typeof claims !== "object" || Array.isArray(claims)) {
    throw new Error(`claims is not a JSON object (got ${describeJsonKind(claims)})`);
  }
  return claims as Record<string, unknown>;
}

/** Build the new KMS-signed INTERNAL_JWT (header.payload.signature) for one row. */
async function buildInternalJwt(
  row: { userId: string; claims: unknown; issuedAt: Date },
  signer: JwtSigner,
): Promise<string> {
  // Mirror `VcIssuanceService.issueVc` payload shape; `credentialStatus` is
  // intentionally omitted (replay/legacy path — no new StatusList slot).
  const payload = buildVcPayload({
    issuer: CIVICSHIP_ISSUER_DID,
    subject: buildUserDid(row.userId),
    claims: asClaimsObject(row.claims),
    issuedAt: row.issuedAt,
  });
  return signJwt(signer, base64urlEncodeJson(payload));
}

async function main(): Promise<number> {
  const flags = parseResignCliFlags(process.argv.slice(2));
  process.stdout.write("Re-issue IDENTUS_JWT VCs as KMS-signed INTERNAL_JWT\n\n");
  process.stdout.write(`mode: ${flags.confirm ? "EXECUTE" : "DRY-RUN"}\n`);
  if (flags.limit !== undefined) process.stdout.write(`limit: ${flags.limit}\n`);
  process.stdout.write("\n");

  const candidates = await prismaClient.vcIssuanceRequest.findMany({
    where: {
      vcFormat: VcFormat.IDENTUS_JWT,
      status: VcIssuanceStatus.COMPLETED,
      revokedAt: null,
    },
    select: {
      id: true,
      userId: true,
      claims: true,
      createdAt: true,
      requestedAt: true,
      completedAt: true,
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: flags.limit,
  });

  process.stdout.write(
    `Found ${candidates.length} IDENTUS_JWT VC row(s) with status=COMPLETED, revokedAt IS NULL\n\n`,
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
  let failed = 0;
  for (const row of candidates) {
    try {
      // `vc_jwt` の有無は問わない: prd の IDENTUS_JWT 行は `vc_jwt` が NULL
      // でも `claims` に VC 内容が残っており、再発行元は常に `claims`。
      const issuedAt = row.completedAt ?? row.requestedAt ?? row.createdAt;

      if (flags.confirm) {
        const newJwt = await buildInternalJwt({ userId: row.userId, claims: row.claims, issuedAt }, signer);
        // Re-apply the original selection filter on write: a row that was
        // revoked or already converted between the read and here must NOT
        // be clobbered. `count !== 1` means the row changed under us.
        const result = await prismaClient.vcIssuanceRequest.updateMany({
          where: {
            id: row.id,
            vcFormat: VcFormat.IDENTUS_JWT,
            status: VcIssuanceStatus.COMPLETED,
            revokedAt: null,
          },
          data: {
            vcFormat: VcFormat.INTERNAL_JWT,
            vcJwt: newJwt,
          },
        });
        if (result.count !== 1) {
          throw new Error(
            "row no longer matches IDENTUS_JWT / status=COMPLETED / revokedAt=null (changed after read)",
          );
        }
        resigned += 1;
        process.stdout.write(`OK    ${row.id}: reissued INTERNAL_JWT (new len=${newJwt.length})\n`);
      } else {
        // dry-run: 件数のみ。KMS 署名・DB 書き込みは行わない。subject DID
        // 導出と claims 形状の検証だけ実施し、不正な行は failed として顕在化。
        // subject DID(userId を含む) はログに出さない。
        buildUserDid(row.userId);
        asClaimsObject(row.claims);
        resigned += 1;
        process.stdout.write(`DRY   ${row.id}: would reissue INTERNAL_JWT\n`);
      }
    } catch (err) {
      failed += 1;
      process.stderr.write(
        `FAIL  ${row.id}: ${err instanceof Error ? err.message : String(err)}\n`,
      );
    }
  }

  process.stdout.write(
    `\n${flags.confirm ? "reissued" : "would-reissue"}: ${resigned}, failed: ${failed}\n`,
  );
  if (!flags.confirm) {
    process.stdout.write("\nRe-run with `--confirm` to apply.\n");
  }
  return failed === 0 ? 0 : 1;
}

runResignScript(main, () => prismaClient.$disconnect());
