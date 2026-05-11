# scripts/

Operational and verification scripts for civicship-api.

## Third-party verification: `verify-from-chain.ts`

A **civicship-non-dependent** verification script that confirms DID and VC
anchors purely from public Cardano data — without trusting api.civicship.app
beyond its initial HTTPS handshake.

Reference: `docs/report/did-vc-internalization.md`
- §11 Phase 0 item **0-4** (third-party verifier must work end-to-end)
- 付録 **B.2** 監査検証 / **B.3** chain 単独検証

### Design constraints

- **No `src/` imports.** The script is standalone TypeScript and does not
  depend on civicship-api domain code, repositories, or Prisma models.
- **No Blockfrost.** No API key is needed. Cardano metadata is read via the
  public **Koios** REST API (`https://api.koios.rest/api/v1`). Any equivalent
  Koios mirror can be substituted via `--koios-url`.
- **Only stable cryptography:** Blake2b-256 (Cardano-native, §5.1.7) via
  `@noble/hashes`, plus Node 22+ global `fetch`.

### Usage

```bash
# Verify a DID — fetches DID Document over HTTPS, then cross-checks the
# proof.docHash against the on-chain metadata 1985 ops[opIndexInTx].h
node --experimental-strip-types scripts/verify-from-chain.ts \
  --did did:web:api.civicship.app:users:u_xyz

# Verify a VC inclusion proof — fetches the inclusion proof over HTTPS,
# locally recomputes the Merkle root with Blake2b-256, then cross-checks
# against the on-chain metadata 1985 vc.root
node --experimental-strip-types scripts/verify-from-chain.ts --vc <vcId>
```

#### Optional flags

| Flag           | Default                          | Purpose                                   |
| -------------- | -------------------------------- | ----------------------------------------- |
| `--base-url`   | `https://api.civicship.app`      | Override origin (e.g. localhost testing)  |
| `--koios-url`  | `https://api.koios.rest/api/v1`  | Use a different Koios endpoint            |
| `--network`    | `mainnet`                        | Used only to build the explorer URL link  |
| `-h, --help`   | —                                | Show usage                                |

### Exit codes

| Code | Meaning      |
| ---- | ------------ |
| `0`  | PASS         |
| `1`  | FAIL         |
| `2`  | Input error  |

### What the script proves

**For `--did <did>` (付録 B.2 step 7-8):**
1. Resolves `did:web:...` → HTTPS URL per W3C spec
2. Fetches the DID Document and reads `proof.{anchorTxHash, opIndexInTx, docHash, anchorStatus}`
3. Requires `anchorStatus === "confirmed"` (PENDING/SUBMITTED cannot be cross-checked yet)
4. Calls Koios `POST /tx_metadata` for the tx hash
5. Asserts `metadata["1985"].ops[opIndexInTx].h === proof.docHash`
6. Outputs PASS/FAIL with the cardanoscan tx URL

**For `--vc <vcId>` (付録 B.2 step 9):**
1. Fetches `${baseUrl}/vc/{vcId}/inclusion-proof` →
   `{ leafHash, leafIndex, siblings[], root, chainTxHash }`
2. Locally reconstructs the Merkle root using Blake2b-256 with the
   **duplicate-last** odd-leaf rule (§5.1.7 — matches
   `src/infrastructure/libs/merkle/merkleTreeBuilder.ts`; this is distinct
   from `@openzeppelin/merkle-tree` JS, which uses carry-up promotion)
3. Confirms the locally computed root equals the API-returned root
4. Calls Koios for the on-chain `metadata["1985"].vc.root`
5. Asserts the on-chain root matches the locally computed root
6. Outputs PASS/FAIL with the cardanoscan tx URL

### What the script intentionally does NOT do

- **No tx signature verification.** Cardano consensus is trusted to ensure
  the tx exists; this is the same trust model as any explorer-based audit.
- **No StatusList / revocation check.** That is the verifier's `B.1` daily
  check, not part of chain integrity. Use a JOSE library against
  `/status/list/:listKey` separately.
- **No JWT signature verification.** Issuer key verification is also B.1
  scope and is independent of chain anchoring.
- **No chain-only scan (付録 B.3).** Brute-force scanning all label-1985 txs
  to reconstruct DID history is the api.civicship.app-down emergency path,
  not the daily/audit path implemented here.

### Required dependencies

The script needs **only** `@noble/hashes` (Blake2b-256 implementation).
It is intentionally not added to `package.json` so the script remains
isolated from the API workspace. Install ad-hoc when running:

```bash
npm install --no-save @noble/hashes
```

Or pin a version in a separate `scripts/package.json` if you maintain this
script in a dedicated CI job.
