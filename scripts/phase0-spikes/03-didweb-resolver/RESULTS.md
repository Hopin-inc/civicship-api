# Phase 0 Spike #3 — `did:web` resolver compatibility

References: `docs/report/did-vc-internalization.md`
- §5.4 (public DID endpoints)
- §5.4.3 (Issuer DID Document)
- §5.4.4 (User DID Document — Active / Tombstone / PENDING)
- §11 Phase 0 row 0-3

## Goal

Verify that the production DID Document shape (`did:web:api.civicship.app`
and `did:web:api.civicship.app:users:<userId>`) round-trips through the
standard `did:web` resolver toolchain (`web-did-resolver` driving
`did-resolver`'s `Resolver` class) for three states:

1. **Active**     — `proof.anchorStatus = "confirmed"`, anchor tx hash present
2. **Pending**    — `proof.anchorStatus = "pending"`, `chainTxHash = null`
3. **Tombstone**  — `deactivated: true` on the document body (§E)

## How to run

From the repo root:

```sh
pnpm install
# terminal 1
pnpm exec tsx scripts/phase0-spikes/03-didweb-resolver/server.ts
# terminal 2
pnpm exec tsx scripts/phase0-spikes/03-didweb-resolver/resolve-test.ts
```

Or, in a single shell:

```sh
SPIKE_PORT=4399 pnpm exec tsx scripts/phase0-spikes/03-didweb-resolver/server.ts &
SERVER_PID=$!
SPIKE_PORT=4399 pnpm exec tsx scripts/phase0-spikes/03-didweb-resolver/resolve-test.ts
EXIT=$?
kill $SERVER_PID
exit $EXIT
```

The repo runs on Node ESM (`"type": "module"`) and ships `tsx` as a
devDependency, so `pnpm exec tsx <file>` is the canonical TS runner.
`pnpm ts-node ...` also works but is slower to spin up.

The test driver exits with code `0` when all three states (plus the
issuer DID) resolve cleanly, and `1` on any assertion failure or
network problem.

## Library versions

| Package           | Direct version | Transitive |
|-------------------|----------------|------------|
| `web-did-resolver`| `2.0.32`       | depends on `did-resolver@^4.1.0` |
| `did-resolver`    | `5.0.1` (direct, used by our test) | also `4.1.0` pulled in by web-did-resolver |
| `cross-fetch`     | `4.1.0` (used by web-did-resolver) | — |
| `tsx`             | `4.21.0` (already a devDependency) | — |

`web-did-resolver` v2 still pins `did-resolver@^4`, but the v4 and v5
`Resolver` API surface is compatible for the methods we use
(`new Resolver({...})`, `.resolve(did)`).

## Localhost / HTTP relaxation

The W3C `did:web` spec mandates HTTPS resolution. Two ways to handle that
in a localhost spike:

1. Run the server on `https://api.civicship.app` via `/etc/hosts` mapping
   plus a self-signed certificate (heavyweight; requires root, breaks CI).
2. **Patch the resolver's URL builder so `https://api.civicship.app/...`
   is routed to `http://localhost:<port>/...`.** ← chosen approach.

`web-did-resolver` does its HTTP via `require('cross-fetch')`. The test
driver replaces that module's export in the Node `require` cache with a
wrapper that rewrites every `https://api.civicship.app` URL to
`http://localhost:${SPIKE_PORT}` before delegating to the original
fetch. This keeps `getResolver()` and `Resolver.resolve()` 100 % stock —
only the network destination is redirected.

In production this relaxation is unnecessary because the server is
served from `https://api.civicship.app` directly (§5.4.7, §8.6).

## Actual resolver output

### 1. Issuer DID Document — `did:web:api.civicship.app`

```json
{
  "didResolutionMetadata": { "contentType": "application/did+ld+json" },
  "didDocumentMetadata":   {},
  "didDocument": {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/jwk/v1"
    ],
    "id": "did:web:api.civicship.app",
    "verificationMethod": [
      {
        "id": "did:web:api.civicship.app#key-2",
        "type": "JsonWebKey2020",
        "controller": "did:web:api.civicship.app",
        "publicKeyJwk": {
          "kty": "OKP", "crv": "Ed25519",
          "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo"
        }
      },
      {
        "id": "did:web:api.civicship.app#key-1",
        "type": "JsonWebKey2020",
        "controller": "did:web:api.civicship.app",
        "publicKeyJwk": {
          "kty": "OKP", "crv": "Ed25519",
          "x": "9w_cMxKpS4WHWRO2ZrXz1NzsT2XWjVeyDhf2W8oN8nM"
        }
      }
    ],
    "assertionMethod":  ["did:web:api.civicship.app#key-2", "did:web:api.civicship.app#key-1"],
    "authentication":   ["did:web:api.civicship.app#key-2", "did:web:api.civicship.app#key-1"]
  }
}
```

PASS — resolver accepts multi-key (rotation overlap) shape from §5.4.3.

### 2. Active — `did:web:api.civicship.app:users:u_active`

```json
{
  "didResolutionMetadata": { "contentType": "application/did+ld+json" },
  "didDocumentMetadata":   {},
  "didDocument": {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": "did:web:api.civicship.app:users:u_active",
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "civicship-cardano-anchor-2026",
      "anchorChain": "cardano:mainnet",
      "anchorTxHash": "a1b2c3d4e5f600000000000000000000000000000000000000000000deadbeef",
      "opIndexInTx": 0,
      "docHash": "1220d2f3a4b5c6d7e8f900112233445566778899aabbccddeeff00112233445566",
      "anchorStatus": "confirmed",
      "anchoredAt": "2026-04-01T12:00:00.000Z",
      "verificationUrl": "https://cardanoscan.io/transaction/a1b2c3d4e5f600000000000000000000000000000000000000000000deadbeef"
    }
  }
}
```

PASS — `didResolutionMetadata.error === undefined`,
`didDocument.id` matches the resolved DID, `proof.anchorStatus === "confirmed"`.

### 3. Pending — `did:web:api.civicship.app:users:u_pending`

```json
{
  "didResolutionMetadata": { "contentType": "application/did+ld+json" },
  "didDocumentMetadata":   {},
  "didDocument": {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": "did:web:api.civicship.app:users:u_pending",
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "civicship-cardano-anchor-2026",
      "anchorChain": "cardano:mainnet",
      "anchorTxHash": null,
      "opIndexInTx": null,
      "docHash": "1220d2f3a4b5c6d7e8f900112233445566778899aabbccddeeff00112233445566",
      "anchorStatus": "pending",
      "anchoredAt": null,
      "verificationUrl": null
    }
  }
}
```

PASS — same as active. The resolver does not introspect `proof.*`, so a
pending anchor (null tx hash) is transparently passed through. **This
is the desired behaviour:** verifiers read `proof.anchorStatus`
themselves and decide whether to trust unanchored DIDs (§5.4.4 §F).

### 4. Tombstone — `did:web:api.civicship.app:users:u_tombstone`

```json
{
  "didResolutionMetadata": { "contentType": "application/did+ld+json" },
  "didDocumentMetadata":   {},
  "didDocument": {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": "did:web:api.civicship.app:users:u_tombstone",
    "deactivated": true,
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "civicship-cardano-anchor-2026",
      "anchorChain": "cardano:mainnet",
      "anchorTxHash": "feedbeef00000000000000000000000000000000000000000000000000c0ffee",
      "opIndexInTx": 1,
      "docHash": "1220deactivated0000000000000000000000000000000000000000000000000000",
      "anchorStatus": "confirmed",
      "anchoredAt": "2026-04-15T08:30:00.000Z",
      "verificationUrl": "https://cardanoscan.io/transaction/feedbeef00000000000000000000000000000000000000000000000000c0ffee"
    }
  }
}
```

PASS — but with the caveat below.

## Library compatibility notes / caveats

### Caveat 1 — `deactivated` is **not** lifted into `didDocumentMetadata`

`web-did-resolver` v2.0.32 does **not** spec-interpret `deactivated:
true` on the response body. Inspecting [`src/resolver.ts`][wdr-src]:

- It fetches the JSON and does one check: `didDocument.id === did`.
- Whatever else is on the body is passed through verbatim into
  `result.didDocument`.
- `didDocumentMetadata` is set to an empty object `{}`. It is never
  populated with `deactivated: true` regardless of the response body.

Per the W3C DID Core 1.0 spec §7.1, deactivation should ideally be
surfaced via `didDocumentMetadata.deactivated`, but `web-did-resolver`
does not implement that mapping. Universal Resolver and Veramo behave
the same way for the `did:web` driver.

[wdr-src]: https://github.com/decentralized-identity/web-did-resolver/blob/v2.0.32/src/resolver.ts

**Implication for civicship-api:** verifiers that consume our DID
Documents must read `didDocument.deactivated === true` from the body
itself, **not** `didDocumentMetadata.deactivated`. This is consistent
with what §5.4.4's Tombstone code path produces today (top-level
`deactivated: true`), so no design change is required — but we should
**document this explicitly** so verifier integrators don't look in the
wrong place.

The test driver therefore accepts any of:

- Top-level `didDocument.deactivated === true` (what we actually emit)
- `didDocumentMetadata.deactivated === true` (what a strict spec-aware
  resolver would emit — currently nobody does this for `did:web`)
- Any `didResolutionMetadata.error` (alternative tombstone signalling)

The active result is the first one.

### Caveat 2 — `contentType` reported as `application/did+ld+json`

We send `Content-Type: application/did+json`, but `web-did-resolver`
overrides that based on whether the body has `@context`:

```ts
const contentType =
  typeof didDocument?.['@context'] !== 'undefined'
    ? 'application/did+ld+json'
    : 'application/did+json'
```

So the resolved metadata reports `application/did+ld+json`. This is
purely a resolver-internal classification and does not affect anything
on the wire. Acceptable.

### Caveat 3 — HTTPS bypass for localhost

See "Localhost / HTTP relaxation" above. The patch only applies to the
test driver (`resolve-test.ts`); the spike server `server.ts` is plain
HTTP. In production we serve `https://api.civicship.app/...` directly,
no patch needed.

### Caveat 4 — Two `did-resolver` versions in node_modules

`pnpm install` lands both `did-resolver@4.1.0` (transitive,
required by `web-did-resolver@2`) and `did-resolver@5.0.1` (the version
we declared as a direct dependency). The test driver uses v5 for the
`Resolver` class. Both work; the `getResolver` factory from
web-did-resolver returns plain functions matching the v4 `DIDResolver`
contract, which v5 still accepts at runtime.

If we want to clean this up later, we could pin
`web-did-resolver@>=2.0.33` once it bumps its dependency, or just hold
the dual install since it has no runtime effect.

## PASS / FAIL

**PASS** for all three states plus the issuer document.

- Active   — resolver returns success, doc body intact, proof preserved.
- Pending  — same. The resolver is anchor-state-agnostic; verifiers
             interpret `proof.anchorStatus` themselves.
- Tombstone— resolver returns success with `deactivated: true` on the
             doc body. Caveat 1 documents that `didDocumentMetadata`
             stays empty — this is a property of `web-did-resolver`,
             not a problem with our doc shape.
- Issuer   — multi-key shape (rotation overlap, §G) round-trips fine.

The `did:web` syntax used in §5.4 (`did:web:api.civicship.app:users:u_xyz`
→ `https://api.civicship.app/users/u_xyz/did.json`) is correctly
handled by the standard resolver.

## Changes shipped

- `scripts/phase0-spikes/03-didweb-resolver/server.ts`     (~170 lines)
- `scripts/phase0-spikes/03-didweb-resolver/resolve-test.ts` (~210 lines)
- `scripts/phase0-spikes/03-didweb-resolver/RESULTS.md`     (this file)
- `package.json`: added `web-did-resolver@^2.0.32` and
  `did-resolver@^5.0.1` to `dependencies`.

PoC code is **throwaway** per Phase 0 rules (§11 Phase 0 受け入れ基準);
the real Express router lives in `src/presentation/router/did.ts` and
will be implemented in Phase 1.
