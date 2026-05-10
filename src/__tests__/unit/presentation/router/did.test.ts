/**
 * Unit tests for `src/presentation/router/did.ts` (§5.4 public routes).
 *
 * Covers the three endpoints:
 *   - GET /.well-known/did.json
 *       → 200 + full Issuer DID Document when `IssuerDidUseCase` yields one
 *       → 200 + minimal static fallback when the use case yields `null`
 *       → 500 when the use case throws
 *   - GET /users/:userId/did.json        → 200 (CONFIRMED / DEACTIVATE)
 *                                          → 404 (no anchor)
 *                                          → 400 (malformed userId)
 *                                          → 500 (resolver throws)
 *   - GET /vc/:vcId/inclusion-proof      → 501 not_implemented
 *                                          → 400 (empty vcId — guarded by
 *                                            Express's own routing, but we
 *                                            still assert the shape on
 *                                            valid input)
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
import type { IssuerDidDocument } from "@/infrastructure/libs/did/issuerDidBuilder";
import type {
  DidDocumentResolver,
  DidDocumentWithProof,
} from "@/infrastructure/libs/did/didDocumentResolver";

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

function registerIssuerDidUseCaseMock(getActiveIssuerDidDocument: jest.Mock): void {
  const mock: Partial<IssuerDidUseCase> = { getActiveIssuerDidDocument };
  container.register("IssuerDidUseCase", { useValue: mock as IssuerDidUseCase });
}

function buildFullIssuerDoc(): IssuerDidDocument {
  return {
    "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/multikey/v1"],
    id: "did:web:api.civicship.app",
    verificationMethod: [
      {
        id: "did:web:api.civicship.app#key-1",
        type: "Multikey",
        controller: "did:web:api.civicship.app",
        publicKeyMultibase: "z6MkfullmockedmultibaseTESTONLY",
      },
    ],
    assertionMethod: ["did:web:api.civicship.app#key-1"],
    authentication: ["did:web:api.civicship.app#key-1"],
    service: [
      {
        id: "did:web:api.civicship.app#issued-credentials",
        type: "CivicshipIssuedCredentials",
        serviceEndpoint: { credentialTypes: ["civicship-attendance-credential-2026"] },
      },
    ],
  };
}

describe("router/did (§5.4)", () => {
  beforeEach(() => {
    container.clearInstances();
  });

  describe("GET /.well-known/did.json", () => {
    it("returns 200 with the full Issuer DID Document when the use case yields one", async () => {
      const fullDoc = buildFullIssuerDoc();
      const getActiveIssuerDidDocument = jest.fn().mockResolvedValue(fullDoc);
      registerIssuerDidUseCaseMock(getActiveIssuerDidDocument);

      const res = await request(buildApp()).get("/.well-known/did.json");

      expect(res.status).toBe(200);
      expect(getActiveIssuerDidDocument).toHaveBeenCalledTimes(1);
      expect(res.body).toEqual(fullDoc);
    });

    it("falls back to the minimal static Document when the use case yields null", async () => {
      const getActiveIssuerDidDocument = jest.fn().mockResolvedValue(null);
      registerIssuerDidUseCaseMock(getActiveIssuerDidDocument);

      const res = await request(buildApp()).get("/.well-known/did.json");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: "did:web:api.civicship.app",
      });
    });

    it("returns 500 when the use case throws (genuine misconfiguration, no silent fallback)", async () => {
      const getActiveIssuerDidDocument = jest
        .fn()
        .mockRejectedValue(new Error("KMS PERMISSION_DENIED"));
      registerIssuerDidUseCaseMock(getActiveIssuerDidDocument);

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
    it("returns 501 not_implemented for any vcId until the batch worker lands", async () => {
      const res = await request(buildApp()).get("/vc/vc_123/inclusion-proof");

      expect(res.status).toBe(501);
      expect(res.body).toMatchObject({
        error: "not_implemented",
        message: expect.stringContaining("Phase 1 step 7"),
      });
    });
  });
});
