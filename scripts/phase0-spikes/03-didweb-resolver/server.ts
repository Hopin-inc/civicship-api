/**
 * Phase 0 Spike #3 — did:web resolver compatibility (server)
 *
 * Minimal Express server that mimics the production DID Document endpoints
 * specified in §5.4 of docs/report/did-vc-internalization.md.
 *
 * Endpoints:
 *   GET /.well-known/did.json
 *     → Issuer DID Document (did:web:api.civicship.app) — §5.4.3
 *
 *   GET /users/:userId/did.json
 *     → User DID Document (did:web:api.civicship.app:users:<userId>) — §5.4.4
 *       Three modes selected by userId:
 *         "u_active"    → active doc, proof.anchorStatus = "confirmed"
 *         "u_pending"   → active doc, proof.anchorStatus = "pending",
 *                        chainTxHash null
 *         "u_tombstone" → { @context, id, deactivated: true } (§E)
 *         other         → 404
 *
 * Headers (per W3C did:web spec recommendations):
 *   Content-Type:  application/did+json
 *   Access-Control-Allow-Origin: *
 *   Cache-Control: public, max-age=60
 *
 * NOTE on HTTP-vs-HTTPS:
 *   The did:web spec normally requires HTTPS. For this localhost spike we
 *   serve plain HTTP and the resolver test (resolve-test.ts) overrides
 *   web-did-resolver's URL builder to point at this HTTP origin. In
 *   production we serve from https://api.civicship.app — see §5.4.7.
 */

import express, { Request, Response } from "express";

const PORT = Number(process.env.SPIKE_PORT ?? 4399);
const ISSUER_DID = "did:web:api.civicship.app";

// -----------------------------------------------------------------------------
// Mock DID Documents
// -----------------------------------------------------------------------------

function buildIssuerDidDocument() {
  // §5.4.3 — multiple verificationMethod entries to exercise key rotation shape.
  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/jwk/v1",
    ],
    id: ISSUER_DID,
    verificationMethod: [
      {
        id: `${ISSUER_DID}#key-2`,
        type: "JsonWebKey2020",
        controller: ISSUER_DID,
        publicKeyJwk: {
          kty: "OKP",
          crv: "Ed25519",
          // mock x — real value would come from KMS
          x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo",
        },
      },
      {
        id: `${ISSUER_DID}#key-1`,
        type: "JsonWebKey2020",
        controller: ISSUER_DID,
        publicKeyJwk: {
          kty: "OKP",
          crv: "Ed25519",
          x: "9w_cMxKpS4WHWRO2ZrXz1NzsT2XWjVeyDhf2W8oN8nM",
        },
      },
    ],
    assertionMethod: [`${ISSUER_DID}#key-2`, `${ISSUER_DID}#key-1`],
    authentication: [`${ISSUER_DID}#key-2`, `${ISSUER_DID}#key-1`],
  };
}

function buildActiveUserDidDocument(userId: string, anchorStatus: "confirmed" | "pending") {
  const did = `${ISSUER_DID}:users:${userId}`;
  const isConfirmed = anchorStatus === "confirmed";
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: did,
    proof: {
      type: "DataIntegrityProof",
      cryptosuite: "civicship-cardano-anchor-2026",
      anchorChain: "cardano:mainnet",
      anchorTxHash: isConfirmed
        ? "a1b2c3d4e5f600000000000000000000000000000000000000000000deadbeef"
        : null,
      opIndexInTx: isConfirmed ? 0 : null,
      docHash: "1220d2f3a4b5c6d7e8f900112233445566778899aabbccddeeff00112233445566",
      anchorStatus,
      anchoredAt: isConfirmed ? "2026-04-01T12:00:00.000Z" : null,
      verificationUrl: isConfirmed
        ? "https://cardanoscan.io/transaction/a1b2c3d4e5f600000000000000000000000000000000000000000000deadbeef"
        : null,
    },
  };
}

function buildTombstoneUserDidDocument(userId: string) {
  // §E — return 200 with deactivated:true (W3C-recommended behaviour for did:web).
  const did = `${ISSUER_DID}:users:${userId}`;
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: did,
    deactivated: true,
    proof: {
      type: "DataIntegrityProof",
      cryptosuite: "civicship-cardano-anchor-2026",
      anchorChain: "cardano:mainnet",
      anchorTxHash: "feedbeef00000000000000000000000000000000000000000000000000c0ffee",
      opIndexInTx: 1,
      docHash: "1220deactivated0000000000000000000000000000000000000000000000000000",
      anchorStatus: "confirmed",
      anchoredAt: "2026-04-15T08:30:00.000Z",
      verificationUrl:
        "https://cardanoscan.io/transaction/feedbeef00000000000000000000000000000000000000000000000000c0ffee",
    },
  };
}

// -----------------------------------------------------------------------------
// Express app
// -----------------------------------------------------------------------------

function setDidHeaders(res: Response) {
  res.set("Content-Type", "application/did+json");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "public, max-age=60");
}

const app = express();

app.get("/.well-known/did.json", (_req: Request, res: Response) => {
  setDidHeaders(res);
  res.status(200).send(JSON.stringify(buildIssuerDidDocument()));
});

app.get("/users/:userId/did.json", (req: Request, res: Response) => {
  const { userId } = req.params;
  let body: object | null = null;

  switch (userId) {
    case "u_active":
      body = buildActiveUserDidDocument(userId, "confirmed");
      break;
    case "u_pending":
      body = buildActiveUserDidDocument(userId, "pending");
      break;
    case "u_tombstone":
      body = buildTombstoneUserDidDocument(userId);
      break;
    default:
      // §5.4.4 — never-issued user → 404
      res.status(404).end();
      return;
  }

  setDidHeaders(res);
  res.status(200).send(JSON.stringify(body));
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[spike-3 server] listening on http://localhost:${PORT}\n` +
      `  GET /.well-known/did.json\n` +
      `  GET /users/u_active/did.json\n` +
      `  GET /users/u_pending/did.json\n` +
      `  GET /users/u_tombstone/did.json`,
  );
});

const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`[spike-3 server] received ${signal}, closing`);
  server.close(() => process.exit(0));
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
