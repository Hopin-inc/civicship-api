/**
 * Unit tests for `src/presentation/router/did.ts` (§5.4 public routes).
 *
 * Covers the three endpoints:
 *   - GET /.well-known/did.json
 *       → 200 + §G overlap multi-key Document when
 *         `IssuerDidUseCase.buildDidDocument()` yields one
 *       → 200 + minimal static fallback when the use case yields `null`
 *       → 500 when the use case throws
 *       → response carries `Content-Type: application/did+json` and
 *         `Cache-Control: public, max-age=300` per §5.4.1
 *   - GET /users/:userId/did.json        → 200 (CONFIRMED / DEACTIVATE)
 *                                          → 404 (no anchor)
 *                                          → 400 (malformed userId)
 *                                          → 500 (resolver throws)
 *   - GET /vc/:vcId/inclusion-proof      → 200 (CONFIRMED)
 *                                          → 404 (not_anchored)
 *                                          → 400 (invalid_vc_id)
 *                                          → 500 (use case throws)
 *
 * The `DidDocumentResolver` and `IssuerDidUseCase` are both stubbed via
 * `container.register` so the tests never touch Prisma or KMS. Each route
 * is exercised through a real Express app via supertest to catch
 * routing-level regressions (path params, JSON content-type, status codes).
 */

import "reflect-metadata";

import express from "express";
import request from "supertest";
import { container } from "tsyringe";

import didRouter from "@/presentation/router/did";
import type IssuerDidUseCase from "@/application/domain/credential/issuerDid/usecase";
import type VcIssuanceUseCase from "@/application/domain/credential/vcIssuance/usecase";
import type { IssuerMultiKeyDidDocument } from "@/infrastructure/libs/did/issuerDidBuilder";
import type {
  DidDocumentResolver,
  DidDocumentWithProof,
} from "@/infrastructure/libs/did/didDocumentResolver";
import type { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import type { InclusionProofResponse } from "@/application/domain/credential/vcIssuance/presenter";

const USER_ID = "u_alice";
const USER_DID = "did:web:api.civicship.app:users:u_alice";
const TX_HASH = "a".repeat(64);
const DOC_HASH = "b".repeat(64);

function buildApp() {
  const app = express();
  app.use("/", didRouter);
  return app;
}

function buildConfirmedDoc(): DidDocumentWithProof {
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: USER_DID,
    proof: {
      type: "DataIntegrityProof",
      cryptosuite: "civicship-merkle-anchor-2026",
      anchorChain: "cardano:mainnet",
      anchorTxHash: TX_HASH,
      opIndexInTx: 0,
      docHash: DOC_HASH,
      anchorStatus: "confirmed",
      anchoredAt: "2026-01-15T12:00:00.000Z",
      verificationUrl: `https://cardanoscan.io/transaction/${TX_HASH}`,
    },
  };
}

function buildTombstoneDoc(): DidDocumentWithProof {
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: USER_DID,
    deactivated: true,
    proof: {
      type: "DataIntegrityProof",
      cryptosuite: "civicship-merkle-anchor-2026",
      anchorChain: "cardano:mainnet",
      anchorTxHash: TX_HASH,
      opIndexInTx: 1,
      docHash: DOC_HASH,
      anchorStatus: "confirmed",
      anchoredAt: "2026-01-20T12:00:00.000Z",
      verificationUrl: `https://cardanoscan.io/transaction/${TX_HASH}`,
    },
  };
}

function registerResolverMock(buildDidDocument: jest.Mock): void {
  const mock: Partial<DidDocumentResolver> = { buildDidDocument };
  container.register("DidDocumentResolver", { useValue: mock as DidDocumentResolver });
}

/**
 * Phase 2: the router consumes `buildDidDocument()` (§G overlap multi-key
 * shape). The legacy `getActiveIssuerDidDocument` is preserved on the use
 * case for backward compat but the router no longer calls it.
 */
function registerIssuerDidUseCaseMock(buildDidDocument: jest.Mock): void {
  const mock: Partial<IssuerDidUseCase> = { buildDidDocument };
  container.register("IssuerDidUseCase", { useValue: mock as IssuerDidUseCase });
}

function registerVcIssuanceUseCaseMock(getInclusionProof: jest.Mock): void {
  const mock: Partial<VcIssuanceUseCase> = { getInclusionProof };
  container.register("VcIssuanceUseCase", { useValue: mock as VcIssuanceUseCase });
}

/**
 * `PrismaClientIssuer` is resolved by the inclusion-proof handler to
 * build the anonymous `IContext`. We never reach into it (the use case
 * mock short-circuits the call), so a sentinel object is enough.
 */
function registerPrismaIssuerStub(): void {
  const stub = { __sentinel: "PrismaClientIssuer" } as unknown as PrismaClientIssuer;
  container.register("PrismaClientIssuer", { useValue: stub });
}

/**
 * Build a §G overlap multi-key Document with one ENABLED key (key-7) and
 * one DISABLED key (key-6). Mirrors the spec §5.4.3 line 1131-1142
 * sample: every key in `verificationMethod`, ENABLED-only refs in
 * `assertionMethod` / `authentication`, plus the
 * `CivicshipIssuedCredentials` discovery `service` block (Gemini review
 * on PR #1124 — must remain present in both single- and multi-key
 * shapes so verifiers can resolve issued credential types uniformly).
 */
function buildMultiKeyIssuerDoc(): IssuerMultiKeyDidDocument {
  const did = "did:web:api.civicship.app";
  return {
    "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/jwk/v1"],
    id: did,
    verificationMethod: [
      {
        id: `${did}#key-7`,
        type: "JsonWebKey2020",
        controller: did,
        publicKeyJwk: {
          kty: "OKP",
          crv: "Ed25519",
          x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo",
        },
      },
      {
        id: `${did}#key-6`,
        type: "JsonWebKey2020",
        controller: did,
        publicKeyJwk: {
          kty: "OKP",
          crv: "Ed25519",
          x: "VCpo2LydsNZm0e7uLCyfKmYO2GMyfV-Z0nL3-bKBR_w",
        },
      },
    ],
    // ENABLED-only — key-6 is the rotating-out tail and MUST NOT be
    // advertised as signable per §9.1.2.
    assertionMethod: [`${did}#key-7`],
    authentication: [`${did}#key-7`],
    service: [
      {
        id: `${did}#issued-credentials`,
        type: "CivicshipIssuedCredentials",
        serviceEndpoint: {
          credentialTypes: ["civicship-attendance-credential-2026"],
        },
      },
    ],
  };
}

describe("router/did (§5.4)", () => {
  beforeEach(() => {
    container.clearInstances();
  });

  describe("GET /.well-known/did.json", () => {
    it("returns 200 with the §G overlap multi-key Document when the use case yields one", async () => {
      const fullDoc = buildMultiKeyIssuerDoc();
      const buildDidDocument = jest.fn().mockResolvedValue(fullDoc);
      registerIssuerDidUseCaseMock(buildDidDocument);

      const res = await request(buildApp()).get("/.well-known/did.json");

      expect(res.status).toBe(200);
      expect(buildDidDocument).toHaveBeenCalledTimes(1);
      // Wire shape: every key in verificationMethod, ENABLED-only in
      // assertionMethod / authentication (§5.4.3 line 1131-1142).
      expect(res.body).toEqual(fullDoc);
      expect(res.body.verificationMethod).toHaveLength(2);
      expect(res.body.verificationMethod[0]).toMatchObject({
        type: "JsonWebKey2020",
        publicKeyJwk: { kty: "OKP", crv: "Ed25519" },
      });
      expect(res.body.assertionMethod).toEqual([
        "did:web:api.civicship.app#key-7",
      ]);
      expect(res.body.authentication).toEqual([
        "did:web:api.civicship.app#key-7",
      ]);
      // `service` parity with the single-key Document so verifiers can
      // discover what credential types this issuer publishes regardless
      // of which shape they hit (Gemini review on PR #1124).
      expect(res.body.service).toEqual([
        {
          id: "did:web:api.civicship.app#issued-credentials",
          type: "CivicshipIssuedCredentials",
          serviceEndpoint: {
            credentialTypes: ["civicship-attendance-credential-2026"],
          },
        },
      ]);
    });

    it("sets Content-Type application/did+json and Cache-Control max-age=300 per §5.4.1", async () => {
      const buildDidDocument = jest.fn().mockResolvedValue(buildMultiKeyIssuerDoc());
      registerIssuerDidUseCaseMock(buildDidDocument);

      const res = await request(buildApp()).get("/.well-known/did.json");

      expect(res.status).toBe(200);
      // Express normalises charset onto the Content-Type — match by
      // prefix so the assertion stays robust if Express ever appends one.
      expect(res.headers["content-type"]).toMatch(/^application\/did\+json/);
      expect(res.headers["cache-control"]).toBe("public, max-age=300");
    });

    it("falls back to the minimal static Document when the use case yields null", async () => {
      const buildDidDocument = jest.fn().mockResolvedValue(null);
      registerIssuerDidUseCaseMock(buildDidDocument);

      const res = await request(buildApp()).get("/.well-known/did.json");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: "did:web:api.civicship.app",
      });
      // Headers still applied on the bootstrap fallback.
      expect(res.headers["content-type"]).toMatch(/^application\/did\+json/);
      expect(res.headers["cache-control"]).toBe("public, max-age=300");
    });

    it("returns 500 when the use case throws (genuine misconfiguration, no silent fallback)", async () => {
      const buildDidDocument = jest
        .fn()
        .mockRejectedValue(new Error("KMS PERMISSION_DENIED"));
      registerIssuerDidUseCaseMock(buildDidDocument);

      const res = await request(buildApp()).get("/.well-known/did.json");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("GET /users/:userId/did.json", () => {
    it("returns 200 with the document when the resolver yields a CONFIRMED anchor", async () => {
      const buildDidDocument = jest.fn().mockResolvedValue(buildConfirmedDoc());
      registerResolverMock(buildDidDocument);

      const res = await request(buildApp()).get(`/users/${USER_ID}/did.json`);

      expect(res.status).toBe(200);
      expect(buildDidDocument).toHaveBeenCalledWith(USER_ID);
      expect(res.body).toMatchObject({
        id: USER_DID,
        proof: { anchorStatus: "confirmed", anchorTxHash: TX_HASH },
      });
    });

    it("returns 200 with a Tombstone document for DEACTIVATE op (§E)", async () => {
      const buildDidDocument = jest.fn().mockResolvedValue(buildTombstoneDoc());
      registerResolverMock(buildDidDocument);

      const res = await request(buildApp()).get(`/users/${USER_ID}/did.json`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: USER_DID, deactivated: true });
    });

    it("returns 404 when the resolver yields null (no anchor row)", async () => {
      const buildDidDocument = jest.fn().mockResolvedValue(null);
      registerResolverMock(buildDidDocument);

      const res = await request(buildApp()).get(`/users/${USER_ID}/did.json`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: "did_not_found" });
    });

    it("returns 400 when the userId fails the §9.2 regex", async () => {
      const buildDidDocument = jest.fn();
      registerResolverMock(buildDidDocument);

      const res = await request(buildApp()).get("/users/Bad%20User/did.json");

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: "invalid_user_id" });
      expect(buildDidDocument).not.toHaveBeenCalled();
    });

    it("returns 500 when the resolver throws", async () => {
      const buildDidDocument = jest.fn().mockRejectedValue(new Error("boom"));
      registerResolverMock(buildDidDocument);

      const res = await request(buildApp()).get(`/users/${USER_ID}/did.json`);

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({ error: "Internal Server Error" });
    });
  });

  describe("GET /vc/:vcId/inclusion-proof", () => {
    function buildSampleProof(): InclusionProofResponse {
      return {
        vcId: "vc_123",
        vcJwt: "header.payload.sig",
        vcAnchorId: "vca_abc",
        rootHash: "ab".repeat(32),
        chainTxHash: "cd".repeat(32),
        proofPath: ["ee".repeat(32), "ff".repeat(32)],
        leafIndex: 1,
        blockHeight: 12345,
      };
    }

    it("returns 200 with the proof DTO when the use case yields one (CONFIRMED anchor)", async () => {
      registerPrismaIssuerStub();
      const sample = buildSampleProof();
      const getInclusionProof = jest.fn().mockResolvedValue(sample);
      registerVcIssuanceUseCaseMock(getInclusionProof);

      const res = await request(buildApp()).get("/vc/vc_123/inclusion-proof");

      expect(res.status).toBe(200);
      expect(getInclusionProof).toHaveBeenCalledTimes(1);
      const [, vcIdArg] = getInclusionProof.mock.calls[0];
      expect(vcIdArg).toBe("vc_123");
      expect(res.body).toEqual(sample);
    });

    it("returns 404 not_anchored when the use case yields null (PENDING / missing)", async () => {
      registerPrismaIssuerStub();
      const getInclusionProof = jest.fn().mockResolvedValue(null);
      registerVcIssuanceUseCaseMock(getInclusionProof);

      const res = await request(buildApp()).get("/vc/vc_pending/inclusion-proof");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: "not_anchored" });
    });

    it("returns 500 when the use case throws (integrity violation / DB error)", async () => {
      registerPrismaIssuerStub();
      const getInclusionProof = jest.fn().mockRejectedValue(new Error("boom"));
      registerVcIssuanceUseCaseMock(getInclusionProof);

      const res = await request(buildApp()).get("/vc/vc_err/inclusion-proof");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal Server Error" });
    });
  });
});
