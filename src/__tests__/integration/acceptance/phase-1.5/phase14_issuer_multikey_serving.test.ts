/**
 * §14.2 受け入れ: Issuer DID `/.well-known/did.json` §G overlap multi-key
 * 配信 (Phase 1.5 / Phase 2).
 *
 * 設計書 §14.2 (line 2117-2125) + §5.4.3 line 1131-1142 のうち:
 *
 *   [x] §G overlap multi-key serving: ENABLED + DISABLED の両 key を
 *       `verificationMethod[]` に並べ、`assertionMethod` /
 *       `authentication` は ENABLED のみ、`service` block は
 *       `CivicshipIssuedCredentials` を保持して 200 を返す
 *
 * Stack under test (integration, no mocks at the application layer):
 *   express → didRouter → IssuerDidUseCase → IssuerDidService
 *     → IssuerDidKeyRepository (stubbed at the DI token, two rows)
 *     → KmsSigner               (stubbed at the DI token, raw 32B pubkeys)
 *
 * The repository and KmsSigner stubs are the only seams — every layer
 * above them runs production code, including the `JsonWebKey2020` JWK
 * builder, the §G filtering of ENABLED vs DISABLED keys for
 * `assertionMethod`, the public-key TTL cache, and the router's
 * §5.4.1 headers (`application/did+json`, `public, max-age=300`).
 *
 * Companion to:
 *   - unit test  : src/__tests__/unit/application/domain/credential/issuerDid/service.test.ts
 *                  (covers the builder shape against direct service calls)
 *   - unit test  : src/__tests__/unit/presentation/router/did.test.ts
 *                  (covers the router with a mocked use case)
 *   - this file  : end-to-end through Express, the real service, and a
 *                  stub repository that emulates the §G rotation state.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.1 (router contract)
 *   docs/report/did-vc-internalization.md §5.4.3 line 1131-1142 (multi-key shape)
 *   docs/report/did-vc-internalization.md §9.1.2 (24h overlap rotation)
 *   docs/report/did-vc-internalization.md §9.1.3 (旧鍵永続保持)
 */

import "reflect-metadata";
import { container } from "tsyringe";
import express from "express";
import request from "supertest";

import didRouter from "@/presentation/router/did";
import {
  setupAcceptanceTest,
  teardownAcceptanceTest,
} from "@/__tests__/integration/acceptance/phase-1.5/__helpers__/setup";
import type { IIssuerDidKeyRepository } from "@/application/domain/credential/issuerDid/data/interface";
import type { IssuerDidKeyRow } from "@/application/domain/credential/issuerDid/data/type";
import type { KmsSigner } from "@/infrastructure/libs/kms/kmsSigner";

// KMS resource names matching the production naming convention
// (`.../cryptoKeyVersions/<n>` is the suffix the builder requires to derive
// the `#key-<n>` fragment for verificationMethod ids).
const KMS_KEY_V1 =
  "projects/civicship-prd/locations/global/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1";
const KMS_KEY_V2 =
  "projects/civicship-prd/locations/global/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/2";

// Two distinct 32-byte Ed25519 public keys. Distinct bytes mean the
// resulting JWK `x` values differ, which lets the test catch a regression
// where both verificationMethod entries accidentally point at the same key.
const PUBKEY_V1 = new Uint8Array(32);
const PUBKEY_V2 = new Uint8Array(32);
for (let i = 0; i < 32; i++) {
  PUBKEY_V1[i] = i + 1;       // 0x01..0x20
  PUBKEY_V2[i] = 0xff - i;    // 0xff..0xe0
}

/**
 * Two-row stub: an older DISABLED key (v1, rotating-out tail) and a newer
 * ENABLED key (v2, current signing key). Order mirrors the repository
 * contract: `listActiveKeys()` returns rows in `activatedAt ASC` order, so
 * v1 comes first in the array.
 */
function makeRepoStub(rows: IssuerDidKeyRow[]): IIssuerDidKeyRepository {
  return {
    // findActiveKey() returns the most recently-activated ENABLED row, used
    // by the legacy single-key path. The multi-key router only consumes
    // listActiveKeys(), but we keep this honest so any incidental call
    // (e.g. via signWithActiveKey if it landed in this flow) doesn't NPE.
    findActiveKey: async () => rows.find((r) => r.deactivatedAt === null) ?? null,
    listActiveKeys: async () => rows,
  };
}

/**
 * Minimal KmsSigner stub that only implements `getPublicKey` (the only
 * method the multi-key serving path reaches). `signEd25519` /
 * `listActiveIssuerKeys` are not on the read path for `/.well-known/did.json`,
 * so we leave them as throwing stubs to surface accidental coupling.
 */
function makeKmsSignerStub(map: Record<string, Uint8Array>): KmsSigner {
  return {
    getPublicKey: async (name: string) => {
      const bytes = map[name];
      if (!bytes) {
        throw new Error(`KmsSignerStub: no public key wired for resource name ${name}`);
      }
      return bytes;
    },
    signEd25519: () => {
      throw new Error("KmsSignerStub.signEd25519: not wired (read-only test)");
    },
    listActiveIssuerKeys: () => {
      throw new Error("KmsSignerStub.listActiveIssuerKeys: not wired (read-only test)");
    },
  } as unknown as KmsSigner;
}

describe("[§14.2] Issuer DID /.well-known/did.json — §G overlap multi-key serving", () => {
  jest.setTimeout(30_000);

  // `setupAcceptanceTest()` calls `container.reset()` AND re-runs
  // `registerProductionDependencies()` before every test, so any
  // `container.register(...)` override done inside one test (e.g.
  // `wireOverlapKeys()` below) is wiped before the next one runs.
  // The bootstrap-fallback test relies on this — it MUST see the
  // production `IssuerDidKeyRepositoryStub` (which returns `[]`), not
  // a stub left behind by a prior test. Do not move this reset into a
  // less aggressive lifecycle hook (e.g. `beforeAll`).
  beforeEach(async () => {
    await setupAcceptanceTest();
  });

  afterAll(async () => {
    await teardownAcceptanceTest();
  });

  function makeApp(): express.Express {
    const app = express();
    app.use("/", didRouter);
    return app;
  }

  /**
   * Wire one DISABLED + one ENABLED row through the real service into the
   * router. Repo + KMS are the only stubs; everything else (use case,
   * service, builder, presenter, router) runs production code.
   */
  function wireOverlapKeys(): void {
    const rowV1Disabled: IssuerDidKeyRow = {
      id: "row_v1",
      kmsKeyResourceName: KMS_KEY_V1,
      activatedAt: new Date("2026-04-01T00:00:00Z"),
      deactivatedAt: new Date("2026-05-01T00:00:00Z"),
    };
    const rowV2Enabled: IssuerDidKeyRow = {
      id: "row_v2",
      kmsKeyResourceName: KMS_KEY_V2,
      activatedAt: new Date("2026-05-01T00:00:00Z"),
      deactivatedAt: null,
    };

    container.register("IssuerDidKeyRepository", {
      useValue: makeRepoStub([rowV1Disabled, rowV2Enabled]),
    });
    container.register("KmsSigner", {
      useValue: makeKmsSignerStub({
        [KMS_KEY_V1]: PUBKEY_V1,
        [KMS_KEY_V2]: PUBKEY_V2,
      }),
    });
  }

  it("returns 200 with both keys in verificationMethod and ENABLED-only in assertionMethod (§5.4.3)", async () => {
    wireOverlapKeys();
    const res = await request(makeApp()).get("/.well-known/did.json");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: "did:web:api.civicship.app",
      "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/jwk/v1"],
    });

    // Both keys must appear in verificationMethod[]; ordering mirrors
    // listActiveKeys() (v1 DISABLED first, v2 ENABLED last).
    expect(res.body.verificationMethod).toHaveLength(2);
    expect(res.body.verificationMethod[0]).toMatchObject({
      id: "did:web:api.civicship.app#key-1",
      type: "JsonWebKey2020",
      controller: "did:web:api.civicship.app",
      publicKeyJwk: { kty: "OKP", crv: "Ed25519" },
    });
    expect(res.body.verificationMethod[1]).toMatchObject({
      id: "did:web:api.civicship.app#key-2",
      type: "JsonWebKey2020",
      controller: "did:web:api.civicship.app",
      publicKeyJwk: { kty: "OKP", crv: "Ed25519" },
    });
    // Distinct keys → distinct JWK `x` values (regression guard against a
    // shared-cache or shared-row bug).
    expect(res.body.verificationMethod[0].publicKeyJwk.x).not.toBe(
      res.body.verificationMethod[1].publicKeyJwk.x,
    );

    // ENABLED-only: DISABLED v1 MUST NOT be advertised as signable (§9.1.2).
    expect(res.body.assertionMethod).toEqual(["did:web:api.civicship.app#key-2"]);
    expect(res.body.authentication).toEqual(["did:web:api.civicship.app#key-2"]);
    expect(res.body.assertionMethod).not.toContain("did:web:api.civicship.app#key-1");

    // service block parity with the single-key Document so verifiers can
    // discover issued credential types regardless of which shape they hit
    // (Gemini review on PR #1124).
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

  it("sets §5.4.1 wire headers (application/did+json, public max-age=300)", async () => {
    wireOverlapKeys();
    const res = await request(makeApp()).get("/.well-known/did.json");

    expect(res.status).toBe(200);
    // Express may append a `; charset=...` — match by prefix.
    expect(res.headers["content-type"]).toMatch(/^application\/did\+json/);
    expect(res.headers["cache-control"]).toBe("public, max-age=300");
  });

  it("falls back to the minimal static Document when no keys are registered (bootstrap)", async () => {
    // Default production wiring uses `IssuerDidKeyRepositoryStub`, which
    // returns [] from listActiveKeys(). No override needed — this exercises
    // the bootstrap state straight from registerProductionDependencies().
    const res = await request(makeApp()).get("/.well-known/did.json");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      "@context": ["https://www.w3.org/ns/did/v1"],
      id: "did:web:api.civicship.app",
    });
    // Headers still applied on the fallback path.
    expect(res.headers["content-type"]).toMatch(/^application\/did\+json/);
    expect(res.headers["cache-control"]).toBe("public, max-age=300");
  });

  it("emits a stable response across repeated requests for the same wire state", async () => {
    // Same in / same out — the §G overlap Document is a pure function of
    // the repository rows + the KMS public keys, so two consecutive GETs
    // must return byte-identical bodies. Catches non-determinism (e.g. a
    // stray `Date.now()` slipping into the builder).
    wireOverlapKeys();
    const app = makeApp();
    const r1 = await request(app).get("/.well-known/did.json");
    const r2 = await request(app).get("/.well-known/did.json");

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r2.body).toEqual(r1.body);
  });
});
