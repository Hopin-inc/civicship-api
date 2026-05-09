/**
 * Phase 0 PoC Spike #2 — Cardano E2E
 *
 * keygen.ts
 *
 * Generates an Ed25519 keypair via @noble/ed25519 v2 (async API) and derives
 * a Cardano preprod *enterprise* payment address (network ID = 0). The
 * resulting bech32 address is what the user must fund via the Cardano
 * preprod faucet (https://docs.cardano.org/cardano-testnets/tools/faucet/)
 * before live submission can succeed.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §3.4 (採用ライブラリ)
 *   docs/report/did-vc-internalization.md §11 Phase 0 0-1
 *
 * Why an enterprise address (no stake credential)?
 *   - Cheapest single-key wallet shape, sufficient for batch metadata anchoring
 *   - The design's Cardano writer is platform-side and never delegates stake
 *   - Aligns with the §I/Phase-0 0-2 KMS-backed single-key plan (the seed here
 *     stands in for the future KMS-managed key)
 *
 * Why use @noble/ed25519 to generate the seed but CSL to derive the address?
 *   - Spec consistency with §3.4 ("v2 系で固定")
 *   - The 32-byte seed is interchangeable: CSL.PrivateKey.from_normal_bytes()
 *     consumes it as a raw Ed25519 seed; @noble/ed25519 derives the same
 *     32-byte public key from it. We assert that equality below as a guard
 *     against future API drift.
 */

// NOTE on imports: `@noble/ed25519` v2 is pure-ESM and Jest's CJS transform
// chokes on it when statically imported (and ts-jest rewrites top-level
// dynamic imports into `require()`, which fails just the same).
//
// We work around this with a `Function`-constructor wrapper that hides the
// dynamic import from ts-jest's transformer — `new Function('return import(s)')`
// produces a function whose body Jest never inspects, so the actual ESM
// import survives until runtime, where Node 22+ handles it natively.
//
// The design (§3.4) mandates `@noble/ed25519@^2.x` for keypair generation, but
// the test suite (and CSL itself) doesn't need it for signing — CSL's
// PrivateKey.from_normal_bytes() consumes the same 32-byte seed format. The
// noble path is therefore reserved for:
//   - random-key generation (CLI / generateCardanoPreprodKeypair)
//   - the noble↔CSL public-key cross-check (verifyNobleCompat)
// Tests that call deriveCardanoPreprodKeypair(seed) skip noble entirely.
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

type NobleEd25519 = typeof import("@noble/ed25519");
type NobleHashesSha2 = typeof import("@noble/hashes/sha2");

const dynamicImport = new Function("s", "return import(s)") as (
  s: string,
) => Promise<unknown>;

let _ed: Promise<NobleEd25519> | null = null;
async function loadNoble(): Promise<NobleEd25519> {
  if (!_ed) {
    _ed = (async () => {
      const ed = (await dynamicImport("@noble/ed25519")) as NobleEd25519;
      const { sha512 } = (await dynamicImport(
        "@noble/hashes/sha2",
      )) as NobleHashesSha2;
      ed.etc.sha512Sync = (...m: Uint8Array[]) =>
        sha512(ed.etc.concatBytes(...m));
      return ed;
    })();
  }
  return _ed;
}

export interface CardanoKeypair {
  /** 32-byte Ed25519 seed (NEVER log / commit) */
  privateKeySeed: Uint8Array;
  /** 32-byte raw Ed25519 public key */
  publicKey: Uint8Array;
  /** CSL PrivateKey instance (wrapping the seed) */
  cslPrivateKey: CSL.PrivateKey;
  /** CSL PublicKey instance (derived from the seed) */
  cslPublicKey: CSL.PublicKey;
  /** Cardano preprod enterprise address, bech32 (`addr_test1v...`) */
  preprodAddressBech32: string;
  /** 28-byte Blake2b-224 hash of the public key, hex */
  paymentKeyHashHex: string;
}

/** Generate a fresh Cardano preprod keypair + enterprise address. */
export async function generateCardanoPreprodKeypair(): Promise<CardanoKeypair> {
  // 1. Generate 32-byte seed via @noble/ed25519 v2 async API
  const ed = await loadNoble();
  const privateKeySeed = ed.utils.randomPrivateKey();
  const kp = await deriveCardanoPreprodKeypair(privateKeySeed);
  // Cross-check: noble and CSL must agree on the public key derived from the
  // same seed. If they ever disagree, every later signature is invalid.
  await verifyNobleCompat(kp);
  return kp;
}

/**
 * Same as generateCardanoPreprodKeypair, but uses a caller-supplied seed.
 * Pure CSL — does NOT touch @noble/ed25519, so this is safe to call from Jest
 * (CommonJS) without triggering the ESM-only import path.
 *
 * For an explicit noble↔CSL cross-check, call `verifyNobleCompat(kp)` after.
 */
export async function deriveCardanoPreprodKeypair(
  privateKeySeed: Uint8Array,
): Promise<CardanoKeypair> {
  if (privateKeySeed.length !== 32) {
    throw new Error(
      `Ed25519 seed must be 32 bytes, got ${privateKeySeed.length}`,
    );
  }

  // Wrap the seed into CSL's PrivateKey type (raw / non-extended)
  const cslPrivateKey = CSL.PrivateKey.from_normal_bytes(privateKeySeed);
  const cslPublicKey = cslPrivateKey.to_public();
  const cslPubBytes = cslPublicKey.as_bytes();

  // Build the preprod (network=0) enterprise address from the payment key hash.
  const paymentKeyHash = cslPublicKey.hash(); // Ed25519KeyHash, Blake2b-224 of pub
  const paymentCred = CSL.Credential.from_keyhash(paymentKeyHash);
  const enterprise = CSL.EnterpriseAddress.new(0, paymentCred); // 0 = testnet/preprod
  const preprodAddressBech32 = enterprise.to_address().to_bech32();

  return {
    privateKeySeed,
    publicKey: cslPubBytes,
    cslPrivateKey,
    cslPublicKey,
    preprodAddressBech32,
    paymentKeyHashHex: bytesToHex(paymentKeyHash.to_bytes()),
  };
}

/**
 * Sanity-check that @noble/ed25519 derives the same 32-byte public key as CSL
 * for the given seed. Run from `generateCardanoPreprodKeypair` and the live
 * runner, never from Jest (which can't load noble's ESM-only build).
 */
export async function verifyNobleCompat(kp: CardanoKeypair): Promise<void> {
  const ed = await loadNoble();
  const noblePub = await ed.getPublicKeyAsync(kp.privateKeySeed);
  if (!bytesEqual(noblePub, kp.publicKey)) {
    throw new Error(
      "Ed25519 public key mismatch between @noble/ed25519 and CSL. " +
        "This means the seed format assumed by the spike is wrong — design §3.4 needs revisiting.",
    );
  }
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function bytesToHex(b: Uint8Array): string {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

// Direct CLI: `pnpm tsx scripts/phase0-spikes/02-cardano-e2e/keygen.ts`.
// We sniff process.argv[1] rather than using `import.meta.url` so this same
// module is loadable from Jest (CommonJS transform) and from tsx (ESM).
const __isCliEntrypoint =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  typeof process.argv[1] === "string" &&
  process.argv[1].endsWith("/keygen.ts");
if (__isCliEntrypoint) {
  generateCardanoPreprodKeypair()
    .then((kp) => {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify(
          {
            preprodAddressBech32: kp.preprodAddressBech32,
            paymentKeyHashHex: kp.paymentKeyHashHex,
            publicKeyHex: bytesToHex(kp.publicKey),
            // NOTE: privateKeySeed printed only for the dry-run; never log this in prod
            privateKeySeedHex_DO_NOT_COMMIT: bytesToHex(kp.privateKeySeed),
            faucetUrl:
              "https://docs.cardano.org/cardano-testnets/tools/faucet/",
          },
          null,
          2,
        ),
      );
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
