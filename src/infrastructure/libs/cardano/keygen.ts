/**
 * Cardano Ed25519 keypair + bech32 address derivation.
 *
 * The civicship platform anchors DID/VC Merkle roots on Cardano via a single
 * platform-side key (see design §5.1.6, §I/Phase-0 0-2). This module is the
 * pure-utility layer for that key — no DI, no DB, no transaction handling.
 *
 * Responsibilities:
 *   - generate a fresh 32-byte Ed25519 seed via @noble/ed25519 v2 (§3.4)
 *   - derive a Cardano enterprise address (network=preprod or mainnet) from
 *     the public key, using @emurgo/cardano-serialization-lib-nodejs
 *   - cross-check that @noble/ed25519 and CSL agree on the public key for the
 *     same seed — a defensive boot-time guard against future API drift
 *
 * Why an *enterprise* address (no stake credential)?
 *   - Cheapest single-key wallet shape, sufficient for batch metadata anchors.
 *   - The Cardano writer is platform-side and never delegates stake.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §3.4 (採用ライブラリ — `@noble/ed25519@^2.x`)
 *   docs/report/did-vc-internalization.md §5.1.6 (Cardano metadata anchoring)
 *   docs/report/did-vc-internalization.md §11 Phase 0 0-1
 *
 * ESM caveat (Jest interaction):
 *   `@noble/ed25519` v2 is pure-ESM. Jest's CJS transform (ts-jest) chokes on
 *   a static `import` at module top-level *and* rewrites top-level dynamic
 *   imports into `require()`, which fails the same way. We work around this
 *   with a `Function`-constructor wrapper that hides the dynamic import from
 *   ts-jest's transformer; see `loadNoble()` below. The actual ESM import
 *   survives until runtime, where Node 22+ handles it natively.
 *
 *   Tests that only need address derivation can pass a pre-generated seed
 *   into `derivePreprodKeypair(seed)` and avoid the noble path entirely
 *   (CSL alone consumes the same 32-byte raw seed format).
 */

import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

type NobleEd25519 = typeof import("@noble/ed25519");
type NobleHashesSha2 = typeof import("@noble/hashes/sha2");

// `new Function('return import(s)')` — see "ESM caveat" header. ts-jest does
// not look inside the Function body, so the dynamic import survives until Node
// runs the code, where ESM is supported natively.
const dynamicImport = new Function("s", "return import(s)") as (
  s: string,
) => Promise<unknown>;

let _ed: Promise<NobleEd25519> | null = null;
async function loadNoble(): Promise<NobleEd25519> {
  _ed ??= (async () => {
    const ed = (await dynamicImport("@noble/ed25519")) as NobleEd25519;
    const { sha512 } = (await dynamicImport(
      "@noble/hashes/sha2",
    )) as NobleHashesSha2;
    // noble v2 needs a sha512 implementation injected for the sync API path.
    ed.etc.sha512Sync = (...m: Uint8Array[]) =>
      sha512(ed.etc.concatBytes(...m));
    return ed;
  })();
  return _ed;
}

/** Cardano network ID for the address derivation. */
export const CARDANO_NETWORK_ID = {
  preprod: 0,
  mainnet: 1,
} as const;
export type CardanoNetwork = keyof typeof CARDANO_NETWORK_ID;

export interface Ed25519KeypairHex {
  /** 32-byte Ed25519 seed as lowercase hex (NEVER log / commit). */
  privateKeyHex: string;
  /** 32-byte raw Ed25519 public key as lowercase hex. */
  publicKeyHex: string;
}

export interface CardanoKeypair {
  /** 32-byte Ed25519 seed (raw bytes; NEVER log / commit). */
  privateKeySeed: Uint8Array;
  /** 32-byte raw Ed25519 public key. */
  publicKey: Uint8Array;
  /** CSL PrivateKey instance (wrapping the seed). */
  cslPrivateKey: CSL.PrivateKey;
  /** CSL PublicKey instance (derived from the seed). */
  cslPublicKey: CSL.PublicKey;
  /** Bech32 enterprise address for the chosen network. */
  addressBech32: string;
  /** 28-byte Blake2b-224 hash of the public key (Cardano payment key hash), hex. */
  paymentKeyHashHex: string;
  /** Network the address is for. */
  network: CardanoNetwork;
}

// ---------------------------------------------------------------------------
// Public API — pure / async helpers
// ---------------------------------------------------------------------------

/**
 * Generate a fresh Ed25519 keypair as hex strings. Async because `@noble`
 * v2 is ESM-only — see header.
 *
 * Use this when the caller only needs the raw key material (e.g. to feed into
 * KMS or to seed the address derivation manually). Use
 * `generateCardanoKeypair()` for a one-shot keypair + address.
 */
export async function generateEd25519Keypair(): Promise<Ed25519KeypairHex> {
  const ed = await loadNoble();
  const seed = ed.utils.randomPrivateKey();
  const pub = await ed.getPublicKeyAsync(seed);
  return {
    privateKeyHex: bytesToHex(seed),
    publicKeyHex: bytesToHex(pub),
  };
}

/**
 * Derive the Cardano preprod (network=0) enterprise address for a given
 * public key.
 *
 * Pure CSL — does not touch `@noble/ed25519`, so it is safe to call from
 * Jest (CommonJS) without triggering the ESM-only import path.
 */
export function derivePreprodAddress(publicKeyHex: string): string {
  return derivePaymentAddress(publicKeyHex, "preprod");
}

/**
 * Derive the Cardano mainnet (network=1) enterprise address for a given
 * public key.
 *
 * Pure CSL — does not touch `@noble/ed25519`.
 */
export function deriveMainnetAddress(publicKeyHex: string): string {
  return derivePaymentAddress(publicKeyHex, "mainnet");
}

function derivePaymentAddress(
  publicKeyHex: string,
  network: CardanoNetwork,
): string {
  const pubBytes = hexToBytes(publicKeyHex);
  if (pubBytes.length !== 32) {
    throw new Error(
      `Ed25519 public key must be 32 bytes, got ${pubBytes.length}`,
    );
  }
  const cslPub = CSL.PublicKey.from_bytes(pubBytes);
  const paymentCred = CSL.Credential.from_keyhash(cslPub.hash());
  const enterprise = CSL.EnterpriseAddress.new(
    CARDANO_NETWORK_ID[network],
    paymentCred,
  );
  return enterprise.to_address().to_bech32();
}

/**
 * Generate a fresh Cardano keypair + enterprise address for the requested
 * network. The seed is freshly randomized via @noble/ed25519 v2 and we
 * cross-check that noble + CSL agree on the public key (`verifyNobleCompat`).
 */
export async function generateCardanoKeypair(
  network: CardanoNetwork = "preprod",
): Promise<CardanoKeypair> {
  const ed = await loadNoble();
  const seed = ed.utils.randomPrivateKey();
  const kp = deriveCardanoKeypair(seed, network);
  await verifyNobleCompat(kp);
  return kp;
}

/**
 * Same as `generateCardanoKeypair`, but uses a caller-supplied seed.
 *
 * Pure CSL — does not import `@noble/ed25519`, so this path is safe for Jest
 * (CommonJS) tests. For an explicit noble↔CSL cross-check call
 * `verifyNobleCompat(kp)` after.
 */
export function deriveCardanoKeypair(
  privateKeySeed: Uint8Array,
  network: CardanoNetwork = "preprod",
): CardanoKeypair {
  if (privateKeySeed.length !== 32) {
    throw new Error(
      `Ed25519 seed must be 32 bytes, got ${privateKeySeed.length}`,
    );
  }
  // CSL.PrivateKey.from_normal_bytes() consumes a raw Ed25519 seed.
  const cslPrivateKey = CSL.PrivateKey.from_normal_bytes(privateKeySeed);
  const cslPublicKey = cslPrivateKey.to_public();
  const cslPubBytes = cslPublicKey.as_bytes();

  // Build the enterprise address from the payment key hash (Blake2b-224 of pub).
  const paymentKeyHash = cslPublicKey.hash();
  const paymentCred = CSL.Credential.from_keyhash(paymentKeyHash);
  const enterprise = CSL.EnterpriseAddress.new(
    CARDANO_NETWORK_ID[network],
    paymentCred,
  );

  return {
    privateKeySeed,
    publicKey: cslPubBytes,
    cslPrivateKey,
    cslPublicKey,
    addressBech32: enterprise.to_address().to_bech32(),
    paymentKeyHashHex: bytesToHex(paymentKeyHash.to_bytes()),
    network,
  };
}

/**
 * Sanity-check that @noble/ed25519 derives the same 32-byte public key as CSL
 * for the given seed. Run from `generateCardanoKeypair` and from a defensive
 * boot-time check; never from Jest CJS tests (which can't load noble's
 * ESM-only build directly — but the dynamicImport-via-Function trick used
 * here lets us call this from a real Node runtime even in jest).
 *
 * Throws if the public keys disagree (which would invalidate every signature
 * we ever produce — fail loudly).
 */
export async function verifyNobleCompat(kp: CardanoKeypair): Promise<void> {
  const ed = await loadNoble();
  const noblePub = await ed.getPublicKeyAsync(kp.privateKeySeed);
  if (!bytesEqual(noblePub, kp.publicKey)) {
    throw new Error(
      "Ed25519 public-key mismatch between @noble/ed25519 and " +
        "@emurgo/cardano-serialization-lib-nodejs. The seed-format " +
        "assumption (raw / non-extended) needs revisiting — design §3.4.",
    );
  }
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function bytesToHex(b: Uint8Array): string {
  let s = "";
  for (const byte of b) {
    s += byte.toString(16).padStart(2, "0");
  }
  return s;
}

function hexToBytes(h: string): Uint8Array {
  const clean = h.startsWith("0x") ? h.slice(2) : h;
  if (clean.length % 2 !== 0) {
    throw new Error(`hex string must have even length, got ${clean.length}`);
  }
  const out = new Uint8Array(clean.length / 2);
  // substr は deprecated。slice + 厳密 hex 検証で `parseInt` の loose-parse 挙動
  // (例: "0z" → 0) を回避（Gemini レビュー指摘）。
  for (let i = 0; i < out.length; i++) {
    const pair = clean.slice(i * 2, i * 2 + 2);
    if (!/^[0-9a-fA-F]{2}$/.test(pair)) {
      throw new Error(`invalid hex char at offset ${i * 2}`);
    }
    out[i] = Number.parseInt(pair, 16);
  }
  return out;
}
