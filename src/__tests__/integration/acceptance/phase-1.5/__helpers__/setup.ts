/**
 * Shared helpers for §14.2 acceptance tests (Phase 1.5).
 *
 * Centralises the boilerplate shared across the 6 phase14_*.test.ts files:
 *   - DI container reset + Prisma issuer wiring (setupAcceptanceTest)
 *   - IContext factory (buildCtx)
 *   - DB disconnect (teardownAcceptanceTest)
 *   - Deterministic fake VC JWT builder (fakeVcJwt) — no Math.random
 *   - Mock Blockfrost / slot provider factory (createMockBlockfrostClient)
 *   - CSL mock factories (cslTxBuilderMockFactory / cslKeygenMockFactory)
 *   - Cardano env wiring (setEnv / restoreEnv / wireCardanoTestEnv)
 *   - Common Prisma seed flow (seedUserParticipationEvaluation, seedVcRequest)
 *
 * The actual `jest.mock(...)` calls must live at the top of each test file
 * because Jest hoists them — but the *factory bodies* are imported from here
 * to avoid duplication.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { gunzipSync } from "node:zlib";
import {
  ChainNetwork,
  CurrentPrefecture,
  EvaluationStatus,
  ParticipationStatus,
  ParticipationStatusReason,
  Source,
  VcFormat,
  VcIssuanceStatus,
} from "@prisma/client";
import { registerProductionDependencies } from "@/application/provider";
import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";

// ---------------------------------------------------------------------------
// Test lifecycle
// ---------------------------------------------------------------------------

/**
 * Standard beforeEach for all §14.2 acceptance tests:
 *   - wipes the DB
 *   - resets the DI container
 *   - re-registers production deps
 *   - returns a fresh PrismaClientIssuer
 */
export async function setupAcceptanceTest(): Promise<{
  issuer: PrismaClientIssuer;
}> {
  await TestDataSourceHelper.deleteAll();
  container.reset();
  registerProductionDependencies();
  const issuer = container.resolve(PrismaClientIssuer);
  return { issuer };
}

/** Standard afterAll for all §14.2 acceptance tests. */
export async function teardownAcceptanceTest(): Promise<void> {
  await TestDataSourceHelper.disconnect();
}

/** Build a minimal IContext from a PrismaClientIssuer. */
export function buildCtx(issuer: PrismaClientIssuer): IContext {
  return { issuer } as unknown as IContext;
}

// ---------------------------------------------------------------------------
// Deterministic fake VC JWT (no Math.random — fixes SonarCloud S2245).
// ---------------------------------------------------------------------------

let saltCounter = 0;

/**
 * Build a fake (non-signed) VC JWT for tests.
 *
 * The salt makes each leaf JWT unique so canonical Merkle leaf hashing
 * produces distinct leaves. Salt is **deterministic** (counter-based) by
 * default — no use of Math.random, which trips Sonar S2245.
 */
export function fakeVcJwt(payload: Record<string, unknown>, salt?: string): string {
  const s = salt ?? `s${++saltCounter}`;
  const header = Buffer.from(JSON.stringify({ alg: "ES256K", typ: "JWT", salt: s })).toString(
    "base64url",
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig-${s}`;
}

/** Reset the internal salt counter (rarely needed; e.g. when a test wants
 *  fully reproducible salts independent of test ordering). */
export function resetFakeVcJwtCounter(): void {
  saltCounter = 0;
}

// ---------------------------------------------------------------------------
// Cardano env helpers
// ---------------------------------------------------------------------------

export const TEST_SEED_HEX = "11".repeat(32);
export const TEST_BECH32 = "addr_test1mock";

const ENV_BACKUP: Record<string, string | undefined> = {};

export function setEnv(key: string, value: string | undefined): void {
  if (!(key in ENV_BACKUP)) ENV_BACKUP[key] = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

export function restoreEnv(): void {
  for (const k of Object.keys(ENV_BACKUP)) {
    const v = ENV_BACKUP[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  for (const k of Object.keys(ENV_BACKUP)) delete ENV_BACKUP[k];
}

/** Wire the standard Cardano preprod env values used by every batch test. */
export function wireCardanoTestEnv(): void {
  setEnv("CARDANO_PLATFORM_PRIVATE_KEY_HEX", TEST_SEED_HEX);
  setEnv("CARDANO_PLATFORM_ADDRESS", TEST_BECH32);
  setEnv("CARDANO_NETWORK", "preprod");
}

// ---------------------------------------------------------------------------
// CSL mock factories — call these from inside the per-file `jest.mock(...)`
// (Jest hoists `jest.mock`, so the call site must stay in each test file).
// ---------------------------------------------------------------------------

/**
 * Build a `jest.mock` factory body for `@/infrastructure/libs/cardano/txBuilder`.
 * Each test passes its own desired `txHashHex` so existing per-file expectations
 * (`"ab".repeat(32)`, `"12".repeat(32)`, …) keep working unchanged.
 */
export function cslTxBuilderMockFactory(opts: { txHashHex: string }) {
  return () => {
    const actual = jest.requireActual("@/infrastructure/libs/cardano/txBuilder");
    return {
      ...actual,
      buildAnchorTx: jest.fn(() => ({
        tx: { __mock: "Transaction" },
        txHashHex: opts.txHashHex,
        txCborBytes: new Uint8Array([0x01, 0x02, 0x03]),
      })),
      buildAuxiliaryData: jest.fn(() => ({ __mock: "AuxiliaryData" })),
    };
  };
}

/** Build a `jest.mock` factory body for `@/infrastructure/libs/cardano/keygen`. */
export function cslKeygenMockFactory() {
  return () => {
    const actual = jest.requireActual("@/infrastructure/libs/cardano/keygen");
    return {
      ...actual,
      deriveCardanoKeypair: jest.fn(() => ({
        cslPrivateKey: { __mock: "PrivateKey" },
        cslPublicKey: { __mock: "PublicKey" },
        addressBech32: TEST_BECH32,
        paymentKeyHashHex: "00".repeat(28),
        privateKeySeed: new Uint8Array(32),
        publicKey: new Uint8Array(32),
        network: "preprod" as const,
      })),
    };
  };
}

// ---------------------------------------------------------------------------
// Blockfrost mock factory
// ---------------------------------------------------------------------------

export interface MockBlockfrostOptions {
  /** UTxO `tx_hash` to return from `getUtxos`. */
  utxoTxHash?: string;
  /** Tx hash returned by `submitTx` and `awaitConfirmation`. */
  submittedTxHash?: string;
  /** Block height returned by `awaitConfirmation`. */
  blockHeight?: number;
}

/**
 * Build a fully-typed Blockfrost client mock with sensible defaults that
 * match the Cardano preprod fixtures used across the §14.2 suite.
 */
export function createMockBlockfrostClient(opts: MockBlockfrostOptions = {}) {
  const submittedTxHash = opts.submittedTxHash ?? "ab".repeat(32);
  const blockHeight = opts.blockHeight ?? 9_876_543;
  const utxoTxHash = opts.utxoTxHash ?? "cd".repeat(32);

  return {
    getProtocolParams: jest.fn().mockResolvedValue({
      min_fee_a: 44,
      min_fee_b: 155381,
      pool_deposit: "500000000",
      key_deposit: "2000000",
      max_val_size: "5000",
      max_tx_size: 16384,
      coins_per_utxo_size: "4310",
    }),
    getUtxos: jest.fn().mockResolvedValue([
      {
        tx_hash: utxoTxHash,
        output_index: 0,
        amount: [{ unit: "lovelace", quantity: "10000000" }],
      },
    ]),
    submitTx: jest.fn().mockResolvedValue(submittedTxHash),
    awaitConfirmation: jest.fn().mockResolvedValue({
      hash: submittedTxHash,
      block_height: blockHeight,
      block_time: 1_700_000_000,
    }),
    getNetwork: jest.fn().mockReturnValue("CARDANO_PREPROD"),
  };
}

/** Create the slot provider mock used together with the Blockfrost client. */
export function createMockSlotProvider(currentSlot = 1_000_000) {
  return { getCurrentSlot: jest.fn().mockResolvedValue(currentSlot) };
}

/**
 * Register Blockfrost + slot provider mocks on the DI container.
 *
 * Use after `setupAcceptanceTest()` (which calls `container.reset()`).
 */
export function registerBlockfrostMocks(blockfrost: unknown, slotProvider: unknown): void {
  container.register("BlockfrostClient", { useValue: blockfrost });
  container.register("BlockfrostLatestSlotProvider", { useValue: slotProvider });
}

// ---------------------------------------------------------------------------
// Common Prisma seed flow
// ---------------------------------------------------------------------------

export interface SeedUserOptions {
  /** Display name. */
  name?: string;
  /** Slug prefix; a `${prefix}-${Date.now()}` slug is produced for uniqueness. */
  slugPrefix?: string;
}

/**
 * Seed a User → Participation → Evaluation chain (the foundation that every
 * §14.2 test builds on). Each test then attaches VC / anchor rows on top.
 */
export async function seedUserParticipationEvaluation(opts: SeedUserOptions = {}): Promise<{
  userId: string;
  participationId: string;
  evaluationId: string;
}> {
  const user = await TestDataSourceHelper.createUser({
    name: opts.name ?? "Acceptance Test User",
    slug: `${opts.slugPrefix ?? "acc"}-${Date.now()}`,
    currentPrefecture: CurrentPrefecture.KAGAWA,
  });
  const participation = await prismaClient.participation.create({
    data: {
      status: ParticipationStatus.PARTICIPATED,
      reason: ParticipationStatusReason.PERSONAL_RECORD,
      source: Source.INTERNAL,
      user: { connect: { id: user.id } },
    },
  });
  const evaluation = await prismaClient.evaluation.create({
    data: {
      status: EvaluationStatus.PASSED,
      participation: { connect: { id: participation.id } },
      evaluator: { connect: { id: user.id } },
    },
  });
  return {
    userId: user.id,
    participationId: participation.id,
    evaluationId: evaluation.id,
  };
}

/**
 * Seed one extra Participation + Evaluation for an existing user.
 *
 * Use when a single test needs multiple VCs for the same user — each
 * `VcIssuanceRequest.evaluationId` is `@unique`, so every additional VC
 * needs its own Participation/Evaluation pair. Pairs land in the EvaluationStatus.PASSED state
 * (the only status that VC issuance/cascade tests care about).
 */
export async function seedExtraEvaluationForUser(userId: string): Promise<{ evaluationId: string }> {
  const evaluation = await prismaClient.evaluation.create({
    data: {
      status: EvaluationStatus.PASSED,
      participation: {
        create: {
          status: ParticipationStatus.PARTICIPATED,
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          source: Source.INTERNAL,
          user: { connect: { id: userId } },
        },
      },
      evaluator: { connect: { id: userId } },
    },
  });
  return { evaluationId: evaluation.id };
}

export interface SeedVcRequestOptions {
  userId: string;
  evaluationId: string;
  vcJwt: string;
  /** Optional StatusList wiring. */
  statusListIndex?: number;
  statusListCredential?: string;
}

/** Seed a single VcIssuanceRequest in COMPLETED state. */
export async function seedVcRequest(opts: SeedVcRequestOptions) {
  return prismaClient.vcIssuanceRequest.create({
    data: {
      user: { connect: { id: opts.userId } },
      evaluation: { connect: { id: opts.evaluationId } },
      vcFormat: VcFormat.INTERNAL_JWT,
      vcJwt: opts.vcJwt,
      status: VcIssuanceStatus.COMPLETED,
      completedAt: new Date(),
      claims: {},
      ...(opts.statusListIndex !== undefined ? { statusListIndex: opts.statusListIndex } : {}),
      ...(opts.statusListCredential !== undefined
        ? { statusListCredential: opts.statusListCredential }
        : {}),
    },
  });
}

export interface SeedPendingVcAnchorOptions {
  vcRequestIds: string[];
  /** Period start (ISO). Defaults to a fixed Phase-1.5 week. */
  periodStart?: Date;
  periodEnd?: Date;
  rootHash?: string;
  network?: ChainNetwork;
}

// ---------------------------------------------------------------------------
// StatusList bitstring helpers (shared between phase14_vc_revocation and
// phase14_did_deactivate_vc_cascade — extracted to keep SonarCloud's
// new-code duplication metric under the 3% threshold).
// ---------------------------------------------------------------------------

/**
 * Read bit `index` from a Status List 2021 bitstring. Bit ordering: bit 0
 * is the MSB of byte 0 (mirrors `setBit` in `StatusListService`).
 */
export function readStatusListBit(bitstring: Uint8Array, index: number): number {
  const byteIdx = Math.floor(index / 8);
  const bitOffset = index % 8;
  const mask = 0x80 >> bitOffset;
  return (bitstring[byteIdx] & mask) === 0 ? 0 : 1;
}

/**
 * Decode the payload of a StatusList VC JWT (3-segment, base64url payload).
 * Returns the raw JSON claims — callers narrow the shape themselves.
 */
export function decodeStatusListJwt(jwt: string): Record<string, unknown> {
  const [, payloadSeg] = jwt.split(".");
  return JSON.parse(Buffer.from(payloadSeg, "base64url").toString("utf8")) as Record<
    string,
    unknown
  >;
}

/**
 * Decompress the `credentialSubject.encodedList` from a StatusList JWT
 * payload back to the raw bitstring bytes.
 */
export function decodeStatusListBitstring(jwt: string): Uint8Array {
  const payload = decodeStatusListJwt(jwt) as {
    credentialSubject?: { encodedList?: string };
  };
  const encoded = payload.credentialSubject?.encodedList;
  if (typeof encoded !== "string") {
    throw new Error("decodeStatusListBitstring: payload has no credentialSubject.encodedList");
  }
  return new Uint8Array(gunzipSync(Buffer.from(encoded, "base64url")));
}

/** Seed a PENDING VcAnchor that wraps the given VcIssuanceRequest leafIds. */
export async function seedPendingVcAnchor(opts: SeedPendingVcAnchorOptions) {
  return prismaClient.vcAnchor.create({
    data: {
      periodStart: opts.periodStart ?? new Date("2026-05-01T00:00:00Z"),
      periodEnd: opts.periodEnd ?? new Date("2026-05-08T00:00:00Z"),
      rootHash: opts.rootHash ?? "0".repeat(64),
      leafIds: opts.vcRequestIds,
      leafCount: opts.vcRequestIds.length,
      network: opts.network ?? ChainNetwork.CARDANO_PREPROD,
    },
  });
}
