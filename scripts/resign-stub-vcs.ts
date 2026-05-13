#!/usr/bin/env -S node --experimental-strip-types
/**
 * Re-sign `STUB_SIGNATURE`-bearing VCs with the production `KmsJwtSigner`.
 *
 * Phase 1 期間中（KmsJwtSigner ランディング前）に発行された VC は
 * signature segment が `STUB_SIGNATURE` (`stub-not-signed`) のままで
 * DB に残っている。Phase 2 移行後はそれらを実 KMS 署名に置換する必要がある。
 * 本スクリプトは:
 *
 *   1. `t_vc_issuance_requests.vc_jwt LIKE '%stub-not-signed%'` で対象を抽出
 *   2. 各行について middle segment (payload) は保持、header は新 signer の
 *      `alg` / `kid` で再構築 (`STUB_SIGNATURE` 時代の `#stub` kid を捨てる)
 *   3. `${headerB64u}.${payloadB64u}` を `KmsJwtSigner.sign()` に渡して
 *      実 Ed25519 base64url signature を取得
 *   4. `vc_jwt` のみを update（vcId / payload / created_at は不変）
 *
 * `--confirm` 無しは dry-run（件数と sample header/kid だけ表示）。
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §16     (Phase 2 KMS swap)
 *   docs/report/did-vc-internalization.md §5.2.2  (VC issuance / JWT shape)
 *
 * 実行例 (dev):
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/resign-stub-vcs.ts
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/resign-stub-vcs.ts --confirm
 *
 * Exit codes: 0 = OK (dry-run or all rows resigned), 1 = error.
 */

import "reflect-metadata";
import "@/application/provider";

import { container } from "tsyringe";

import { prismaClient } from "@/infrastructure/prisma/client";
import type { JwtSigner } from "@/application/domain/credential/shared/jwtSigner";
import { STUB_SIGNATURE } from "@/application/domain/credential/shared/stubJwtSigner";

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

function payloadSegmentOf(vcJwt: string): string {
  const segments = vcJwt.split(".");
  if (segments.length !== 3) {
    throw new Error(`vcJwt has ${segments.length} segments, expected 3`);
  }
  return segments[1];
}

function isStubSignature(vcJwt: string): boolean {
  const segments = vcJwt.split(".");
  return segments[2] === Buffer.from(STUB_SIGNATURE, "utf8").toString("base64url")
    || segments[2] === STUB_SIGNATURE;
}

async function rebuildJwt(payloadB64u: string, signer: JwtSigner): Promise<string> {
  await signer.prepare();
  const headerB64u = base64urlEncodeJson({
    alg: signer.alg,
    typ: "JWT",
    kid: signer.kid,
  });
  const signingInput = `${headerB64u}.${payloadB64u}`;
  const signature = await signer.sign(signingInput);
  return `${signingInput}.${signature}`;
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2));
  process.stdout.write("Re-sign STUB_SIGNATURE VCs with KmsJwtSigner\n\n");
  process.stdout.write(`mode: ${flags.confirm ? "EXECUTE" : "DRY-RUN"}\n`);
  if (flags.limit !== undefined) process.stdout.write(`limit: ${flags.limit}\n`);
  process.stdout.write("\n");

  const candidates = await prismaClient.vcIssuanceRequest.findMany({
    where: {
      vcJwt: { contains: STUB_SIGNATURE },
    },
    select: { id: true, vcJwt: true },
    orderBy: { createdAt: "asc" },
    take: flags.limit,
  });

  process.stdout.write(`Found ${candidates.length} stub-signed VC row(s)\n\n`);
  if (candidates.length === 0) {
    return 0;
  }

  // Sanity-check signer once before iterating so we fail loudly if KMS /
  // active-key DB row is misconfigured before touching any row.
  const signer = container.resolve<JwtSigner>("VcJwtSigner");
  await signer.prepare();
  process.stdout.write(`signer: alg=${signer.alg}, kid=${signer.kid}\n\n`);

  let updated = 0;
  let failed = 0;
  for (const row of candidates) {
    try {
      if (!isStubSignature(row.vcJwt)) {
        process.stdout.write(`SKIP  ${row.id}: signature not exactly STUB (likely already real-signed)\n`);
        continue;
      }
      const payloadB64u = payloadSegmentOf(row.vcJwt);
      const newJwt = await rebuildJwt(payloadB64u, signer);

      if (flags.confirm) {
        await prismaClient.vcIssuanceRequest.update({
          where: { id: row.id },
          data: { vcJwt: newJwt },
        });
        updated += 1;
        process.stdout.write(`OK    ${row.id}: resigned (new len=${newJwt.length})\n`);
      } else {
        updated += 1;
        process.stdout.write(`DRY   ${row.id}: would resign (new len=${newJwt.length})\n`);
      }
    } catch (err) {
      failed += 1;
      process.stderr.write(
        `FAIL  ${row.id}: ${err instanceof Error ? err.message : String(err)}\n`,
      );
    }
  }

  process.stdout.write(
    `\n${flags.confirm ? "resigned" : "would-resign"}: ${updated}, failed: ${failed}\n`,
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
