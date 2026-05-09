# Phase 0 Spike #2 — Cardano E2E

Verifies that we can construct a Cardano transaction with `metadata label 1985`
containing the design's full structure (§5.1.6), sign it with a local Ed25519
key, and submit it to Cardano preprod via Blockfrost.

Design reference: `docs/report/did-vc-internalization.md` §11 Phase 0 0-1.

## TL;DR

| Verification | Status |
|---|---|
| Dry-run (no network) | **PASS** — exits 0 with valid signed tx |
| Unit tests (Jest) | **PASS** — 20/20 |
| Live preprod submit | **DEFERRED** — requires user-provided `BLOCKFROST_PROJECT_ID` + funded address |

→ Spike is **code-complete**. Live verification is operationally pending.

## Layout

```
scripts/phase0-spikes/02-cardano-e2e/
├── keygen.ts         # Ed25519 keypair → preprod enterprise address
├── merkle.ts         # Blake2b-256 Merkle tree (root + proof + verify)
├── build-tx.ts       # buildMetadata + buildAnchorTx (pure, no network)
├── run.ts            # Orchestrator: dry-run by default, live with env
├── __tests__/
│   └── build-tx.test.ts   # 20 unit tests
└── RESULTS.md        # this file
```

## Setup

```bash
# 1. Install (already part of `pnpm install` from package.json)
pnpm install
```

The spike adds these dependencies (declared in `package.json`):

| Package | Version | Purpose |
|---|---|---|
| `@blockfrost/blockfrost-js` | ^6.1.1 | Blockfrost preprod client (live mode only) |
| `@emurgo/cardano-serialization-lib-nodejs` | ^15.0.3 | Cardano tx construction + signing |
| `@noble/ed25519` | ^2.3.0 | Ed25519 keygen + signature compatibility check |
| `@noble/hashes` | ^1.8.0 | Blake2b-256 (Merkle hash, RFC 7693) |
| `cbor-x` | ^1.6.4 | CBOR encoding for DID Document `doc` field |

### Blockfrost setup (live mode only)

1. Create a Blockfrost account: <https://blockfrost.io/>
2. Create a new project, set network to **Cardano preprod**.
3. Copy the project ID (starts with `preprod...`).
4. Store it as a Secret Manager value (Phase 1) or in your local
   `.env.local` (do NOT commit). For the spike: just `export` it.

### Cardano preprod faucet

1. Run `keygen.ts` (see below) to obtain an `addr_test1v...` address.
2. Open <https://docs.cardano.org/cardano-testnets/tools/faucet/> and
   request 10 000 tADA. Confirms in ~30 s.

## How to run

### Dry-run (the actual verification, no network needed)

```bash
pnpm tsx scripts/phase0-spikes/02-cardano-e2e/run.ts
```

Generates a fresh keypair, builds and signs a tx with sample metadata 1985,
asserts the 16 KB / 64 B constraints, and prints sizes.

### Unit tests

```bash
pnpm jest scripts/phase0-spikes/02-cardano-e2e/__tests__/
```

20 tests covering:
- §5.1.6 metadata top-level keys (`v`, `bid`, `ts`, `tx`, `vc`, `ops`)
- 64 B chunking for >64 B values (text + bytes)
- 16 KB ceiling enforcement with helpful error
- Empty UTXO rejection
- Tx CBOR round-trip + witness presence
- Blake2b-256 vs canonical "abc" vector + RFC 7693 Appendix A vector
- Merkle root determinism, single leaf, even/odd leaf counts
- Proof verification for all indices, tampered-proof rejection

### Live mode (deferred)

```bash
# 1. Generate a key + obtain its address
pnpm tsx scripts/phase0-spikes/02-cardano-e2e/keygen.ts
#    → prints `preprodAddressBech32` and `privateKeySeedHex_DO_NOT_COMMIT`
#
# 2. Fund the printed address via the preprod faucet (URL above)
#
# 3. Export creds and run
export BLOCKFROST_PROJECT_ID=preprod...
export CARDANO_PRIVATE_KEY_SEED_HEX=<seed printed in step 1>
pnpm tsx scripts/phase0-spikes/02-cardano-e2e/run.ts
```

The live path will:
1. Fetch UTXOs via `addressesUtxosAll`
2. Fetch protocol params via `epochsLatestParameters`
3. Fetch latest slot via `blocksLatest`
4. Build + sign tx (same path as dry-run)
5. Submit via `txSubmit`
6. Poll `txs` for confirmation (≤ 5 min)
7. Re-fetch metadata via `txsMetadata` and assert `bid` matches → **round-trip integrity check**

On success it prints the explorer URL:
`https://preprod.cardanoscan.io/transaction/<txHash>`

## Dry-run output (observed, 2026-05-09)

```text
=== Phase 0 Spike #2 — Cardano E2E (dry-run) ===

[1/4] Keypair
  preprodAddressBech32: addr_test1vzapwhrr6fj0pnv2y3hdj2jq3k8f334ctjenqwph83hkfcch2zqt3
  paymentKeyHashHex:    ba175c63d264f0cd8a246ed92a408d8e98c6b85cb33038373c6f64e3
  publicKeyHex:         2dc951aae7e105799a51112fdedc9a6c698d9e7c33955a75cd4b055c501e69f5

[2/4] Metadata input (label 1985, §5.1.6)
{
  "v": 1,
  "bid": "ckspike02cardanoeec",
  "ts": 1778361274,
  "tx": { "root": "b3165822b2014d0121b9181e609f9dec1401231bc141a35c609b28c07258a9cf", "count": 5 },
  "vc": { "root": "006d92d03184ef74646ed737bb22703482d0b7e10430c4298d66554fd301b128", "count": 3 },
  "opsCount": 3,
  "opKinds": [ "c", "u", "d" ]
}

[3/4] Metadata serialization
  AuxiliaryData CBOR size: 1076 bytes
  16KB ceiling check:      OK (1076/16384)
  64B per-string check:    (enforced inside builder via chunking)

[4/4] Tx build + sign (synthetic UTXOs)
  txHashHex:         77df5814f9efd188d6ab3b06cb6be9365778f5aad200ee8110d8bc7b37b0b641
  txCborBytes size:  1313 bytes
  protocol max_tx_size check: OK

Dry-run complete. […]
Exit 0 — dry-run PASS.
```

(The keypair is fresh on every run, so addresses/hashes vary; sizes are stable.)

### Sizing observation

| What | Bytes |
|---|---|
| §5.1.6 sample metadata (5 tx leaves + 3 vc leaves + 3 ops, with full DID Documents) | 1 076 |
| Full signed tx (1 input, 1 change output, 1 vkey witness, aux data) | 1 313 |
| 16 KB ceiling | 16 384 |

→ Plenty of headroom. The 5 000-leaf backfill (§1.0 規模感) only adds the
two 32-byte Merkle roots, not the per-leaf data, so it stays comfortably
below 16 KB even at production volume.

## Unit test results (observed, 2026-05-09)

```
PASS scripts/phase0-spikes/02-cardano-e2e/__tests__/build-tx.test.ts (18.44 s)
  buildMetadata — §5.1.6 structure
    ✓ includes all top-level keys (v, bid, ts, tx, vc, ops)
    ✓ omits the vc block when not provided
    ✓ encodes ops list with the right length
  buildMetadata — 64-byte chunking
    ✓ chunks a long DID Document into a list of <=64B byte segments
    ✓ keeps small docs as a single <=64B bytes element
  buildMetadata — 16KB ceiling
    ✓ a small payload is well under 16KB
    ✓ buildAnchorTx throws a helpful error when metadata exceeds 16KB
  buildAnchorTx — sign + serialize end-to-end
    ✓ produces a tx whose CBOR round-trips through CSL Transaction.from_bytes
    ✓ rejects empty UTXO sets with an actionable error
  merkle — Blake2b-256 against known test vector
    ✓ blake2b('abc', 32) matches the canonical vector
    ✓ blake2b('abc', 64) matches RFC 7693 Appendix A
    ✓ canonicalLeafHash is exactly Blake2b-256(utf8(id))
  merkle — root determinism + edge cases
    ✓ same input produces same root (determinism)
    ✓ different ordering produces different root (canonical-order matters)
    ✓ single leaf: root === leafHash
    ✓ rejects empty input with explicit error
    ✓ odd leaf count uses last-leaf duplication (5 leaves)
    ✓ even leaf count works (4 leaves, full binary tree)
    ✓ proofs verify for all indices, even with odd-leaf duplication
    ✓ invalid proof rejects (defensive check)

Tests:       20 passed, 20 total
```

## Decision criteria

| Gate | Status | Notes |
|---|---|---|
| Dry-run exits 0 with valid signed tx | ✅ | tx CBOR 1 313 B, well under 16 384 limit |
| All unit tests pass | ✅ | 20/20 |
| Live mode end-to-end on preprod | ⏳ | requires user `BLOCKFROST_PROJECT_ID` + funded faucet address |

**Conclusion**: spike is **code-complete**. The metadata-1985 structure
(§5.1.6) is valid Cardano CBOR and signs cleanly with a local Ed25519 key.
Live submission against preprod is unblocked the moment a project ID and
faucet funding are provided — no further code changes anticipated.

## Notes for the reader

- **CSL v15 API**: `hash_transaction(body)` was removed; we now use
  `FixedTransaction.new_with_auxiliary(...)` + `sign_and_add_vkey_signature`.
  This avoids the historical body-hash vs. submitted-bytes mismatch footgun.
- **Noble v2 ESM-only**: `@noble/ed25519@2` is pure ESM. Jest's CommonJS
  transformer can't load it directly, so we hide the dynamic import behind
  a `Function`-constructor wrapper (`new Function('s','return import(s)')`).
  Tests skip the noble path entirely (CSL alone signs); only
  `generateCardanoPreprodKeypair` (and the live runner) hit
  `verifyNobleCompat()` for the noble↔CSL cross-check.
- **Spec compatibility**: §5.1.6 examples show `prev: null`. CBOR-metadata
  has no native null type; the spike encodes "no prev" as an empty text
  metadatum and flags this as an open ADR in `build-tx.ts` (not blocking
  for Phase 0, but Phase 1 should pin the canonical form).

## What this spike does NOT prove

- Mainnet behavior (we're on preprod). Per design, Cardano metadata
  semantics are identical between networks.
- KMS-backed signing (Phase 0 0-2). The spike uses a local seed; the KMS
  wiring is the next spike's responsibility.
- did:web resolver (Phase 0 0-3, see `scripts/phase0-spikes/03-didweb-resolver`).
- 3rd-party verifier (Phase 0 0-4).
