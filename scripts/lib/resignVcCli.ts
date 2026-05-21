/**
 * Shared CLI helpers for the VC re-signing operator scripts.
 *
 * `scripts/resign-stub-vcs.ts` (Phase 2 `STUB_SIGNATURE` → KMS swap) and
 * `scripts/backfill-resign-identus-vcs.ts` (IDENTUS_JWT 撤去 backfill) both
 * parse the same `--confirm` / `--limit=N` flags, base64url-encode JWT
 * segments, re-sign a `header.payload` pair via a `JwtSigner`, and tear
 * down the Prisma connection before exiting. Centralising those here keeps
 * the two scripts from drifting and removes the cross-file duplication
 * SonarCloud flags.
 *
 * Kept under `scripts/lib/`: these helpers are script-local. The only
 * non-relative import is the `JwtSigner` *type* (erased at runtime), so —
 * like `cardanoScriptHelpers.ts` — there is no runtime dependency on the
 * DI container or Prisma; the Prisma teardown is injected by the caller.
 */

import type { JwtSigner } from "@/application/domain/credential/shared/jwtSigner";

export interface ResignCliFlags {
  confirm: boolean;
  limit?: number;
}

/** Parse the `--confirm` / `--limit=N` flags shared by the re-sign scripts. */
export function parseResignCliFlags(argv: string[]): ResignCliFlags {
  const flags: ResignCliFlags = { confirm: false };
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

/** Encode a JSON-serialisable value as a base64url JWT segment (RFC 4648 §5). */
export function base64urlEncodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

/**
 * Re-sign a JWT: rebuild the header from the signer's current `alg` / `kid`,
 * join it to the supplied (already base64url-encoded) payload segment, and
 * append a fresh signature. `signer.prepare()` is awaited first so the
 * synchronous `alg` / `kid` reads land on the same key `sign()` uses.
 */
export async function signJwt(signer: JwtSigner, payloadB64u: string): Promise<string> {
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

/**
 * Run a script `main()` that resolves to a process exit code, always
 * running `cleanup` (typically `prismaClient.$disconnect()`) before exit on
 * both the success and failure paths.
 */
export function runResignScript(
  main: () => Promise<number>,
  cleanup: () => Promise<unknown>,
): void {
  main()
    .then((code) => {
      cleanup().finally(() => process.exit(code));
    })
    .catch((err: unknown) => {
      process.stderr.write(
        `ERROR: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`,
      );
      cleanup().finally(() => process.exit(1));
    });
}
