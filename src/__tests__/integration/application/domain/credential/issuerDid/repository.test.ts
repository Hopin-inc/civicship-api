/**
 * Integration tests for `IssuerDidKeyRepository` (§5.4.3 / §G).
 *
 * Covers the persistence-layer behaviours that the previous Phase 1.5
 * Strategy A stub could not exercise:
 *
 *   - empty table → `findActiveKey() === null`, `listActiveKeys() === []`
 *     (bootstrap state for a freshly-deployed environment)
 *   - one ENABLED row → `findActiveKey()` returns it, `listActiveKeys()`
 *     returns the same row
 *   - one DISABLED row (rotating-out tail, `deactivatedAt !== null`) →
 *     `findActiveKey()` returns null even though the row exists;
 *     `listActiveKeys()` still returns it (§9.1.3 — DISABLED kept forever
 *     for past-VC verification)
 *   - mid-rotation overlap (1 ENABLED + 1 DISABLED) → `findActiveKey()`
 *     returns the ENABLED row, `listActiveKeys()` returns both in
 *     activatedAt ASC order
 *   - multiple ENABLED rows (transient overlap during admin activation
 *     before the old key is disabled) → `findActiveKey()` returns the
 *     most-recently-activated row
 *
 * Schema references:
 *   src/infrastructure/prisma/schema.prisma — `model IssuerDidKey`
 *   migrations/20260512060000_add_issuer_did_keys/migration.sql
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.3 (IssuerDidService)
 *   docs/report/did-vc-internalization.md §G    (key rotation overlap)
 *   docs/report/did-vc-internalization.md §9.1.2 (24h overlap)
 *   docs/report/did-vc-internalization.md §9.1.3 (DISABLED 永続保持)
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { prismaClient } from "@/infrastructure/prisma/client";
import IssuerDidKeyRepository from "@/application/domain/credential/issuerDid/data/repository";

const KMS_KEY_V1 =
  "projects/kyoso-dev/locations/asia-northeast1/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1";
const KMS_KEY_V2 =
  "projects/kyoso-dev/locations/asia-northeast1/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/2";
const KMS_KEY_V3 =
  "projects/kyoso-dev/locations/asia-northeast1/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/3";

describe("IssuerDidKeyRepository (integration)", () => {
  jest.setTimeout(30_000);
  let repo: IssuerDidKeyRepository;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    container.reset();
    registerProductionDependencies();
    repo = container.resolve<IssuerDidKeyRepository>("IssuerDidKeyRepository");
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  describe("empty table (bootstrap state)", () => {
    it("findActiveKey() returns null when no rows exist", async () => {
      await expect(repo.findActiveKey()).resolves.toBeNull();
    });

    it("listActiveKeys() returns [] when no rows exist", async () => {
      await expect(repo.listActiveKeys()).resolves.toEqual([]);
    });
  });

  describe("single ENABLED row", () => {
    it("findActiveKey() returns the row; listActiveKeys() returns [row]", async () => {
      const row = await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V1,
          activatedAt: new Date("2026-01-01T00:00:00Z"),
        },
      });

      const active = await repo.findActiveKey();
      expect(active).toMatchObject({
        id: row.id,
        kmsKeyResourceName: KMS_KEY_V1,
        deactivatedAt: null,
      });

      const all = await repo.listActiveKeys();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(row.id);
    });
  });

  describe("single DISABLED row (orphan tail)", () => {
    it("findActiveKey() returns null but listActiveKeys() still returns it (§9.1.3)", async () => {
      const row = await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V1,
          activatedAt: new Date("2026-01-01T00:00:00Z"),
          deactivatedAt: new Date("2026-03-01T00:00:00Z"),
        },
      });

      // No ENABLED key → no row eligible to sign with.
      await expect(repo.findActiveKey()).resolves.toBeNull();

      // But the DISABLED row stays in listActiveKeys so past-VC
      // verifiers can still resolve its public key via the DID
      // Document's verificationMethod array.
      const all = await repo.listActiveKeys();
      expect(all).toHaveLength(1);
      expect(all[0]).toMatchObject({ id: row.id, deactivatedAt: row.deactivatedAt });
    });
  });

  describe("§G overlap window (ENABLED + DISABLED)", () => {
    it("findActiveKey() returns the ENABLED row; listActiveKeys() returns both ordered by activatedAt ASC", async () => {
      const disabled = await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V1,
          activatedAt: new Date("2026-01-01T00:00:00Z"),
          deactivatedAt: new Date("2026-05-01T00:00:00Z"),
        },
      });
      const enabled = await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V2,
          activatedAt: new Date("2026-05-01T00:00:00Z"),
        },
      });

      // findActiveKey targets the still-signable row.
      const active = await repo.findActiveKey();
      expect(active?.id).toBe(enabled.id);
      expect(active?.deactivatedAt).toBeNull();

      // listActiveKeys publishes BOTH (DISABLED v1 first, ENABLED v2
      // second) so the DID Document's verificationMethod array is
      // stable across re-renders and verifiers can resolve VCs signed
      // with either key.
      const all = await repo.listActiveKeys();
      expect(all).toHaveLength(2);
      expect(all.map((r) => r.id)).toEqual([disabled.id, enabled.id]);
    });
  });

  describe("multiple ENABLED rows (transient activation overlap)", () => {
    it("findActiveKey() returns the most-recently-activated row", async () => {
      // Operational sequence the admin runbook performs:
      //   1. Activate v2 (INSERT with deactivatedAt = NULL)
      //   2. Eventually deactivate v1 (UPDATE deactivatedAt = now)
      // Between (1) and (2) the table briefly holds two ENABLED rows.
      // findActiveKey must still return a single, deterministic row —
      // the newer one — so a sign() call during the overlap doesn't
      // pick the rotating-out key.
      const older = await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V1,
          activatedAt: new Date("2026-01-01T00:00:00Z"),
        },
      });
      const newer = await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V2,
          activatedAt: new Date("2026-05-01T00:00:00Z"),
        },
      });

      const active = await repo.findActiveKey();
      expect(active?.id).toBe(newer.id);

      // listActiveKeys still publishes both — ordered by activatedAt ASC.
      const all = await repo.listActiveKeys();
      expect(all.map((r) => r.id)).toEqual([older.id, newer.id]);
    });
  });

  describe("kmsKeyResourceName uniqueness", () => {
    it("rejects a duplicate kmsKeyResourceName (schema @unique)", async () => {
      await prismaClient.issuerDidKey.create({
        data: { kmsKeyResourceName: KMS_KEY_V1 },
      });
      await expect(
        prismaClient.issuerDidKey.create({
          data: { kmsKeyResourceName: KMS_KEY_V1 },
        }),
      ).rejects.toThrow();
    });
  });

  describe("listActiveKeys ordering with 3+ rows", () => {
    it("preserves activatedAt ASC even when inserted out of order", async () => {
      // Insert v3 first, then v1, then v2 — exercise that ORDER BY is
      // on activated_at not the insertion / id order.
      await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V3,
          activatedAt: new Date("2026-09-01T00:00:00Z"),
        },
      });
      await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V1,
          activatedAt: new Date("2026-01-01T00:00:00Z"),
          deactivatedAt: new Date("2026-05-01T00:00:00Z"),
        },
      });
      await prismaClient.issuerDidKey.create({
        data: {
          kmsKeyResourceName: KMS_KEY_V2,
          activatedAt: new Date("2026-05-01T00:00:00Z"),
          deactivatedAt: new Date("2026-09-01T00:00:00Z"),
        },
      });

      const all = await repo.listActiveKeys();
      expect(all.map((r) => r.kmsKeyResourceName)).toEqual([
        KMS_KEY_V1,
        KMS_KEY_V2,
        KMS_KEY_V3,
      ]);
    });
  });
});
