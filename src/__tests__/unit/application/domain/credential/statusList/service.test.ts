/**
 * Unit tests for `StatusListService` (Phase 1 step 8 — §D revocation).
 *
 * The repository is replaced with an in-memory mock so the encoding logic
 * (gzip + base64url + bit flips) can be verified end-to-end without
 * spinning up Postgres.
 */

import "reflect-metadata";
import { gunzipSync, gzipSync } from "node:zlib";
import { container } from "tsyringe";
import StatusListService, {
  DEFAULT_STATUS_LIST_CAPACITY,
  STUB_SIGNATURE_STATUS,
  buildStatusListUrl,
  buildStatusListVcPayload,
} from "@/application/domain/credential/statusList/service";
import type {
  IStatusListRepository,
  VcRevocationRow,
} from "@/application/domain/credential/statusList/data/interface";
import type { StatusListCredentialRow } from "@/application/domain/credential/statusList/data/type";
import { IContext } from "@/types/server";

function emptyCompressed(capacity: number): Uint8Array {
  return gzipSync(Buffer.alloc(Math.ceil(capacity / 8)));
}

function makeRow(overrides: Partial<StatusListCredentialRow>): StatusListCredentialRow {
  const compressed = emptyCompressed(overrides.capacity ?? DEFAULT_STATUS_LIST_CAPACITY);
  return {
    id: "row-1",
    listKey: "1",
    encodedList: compressed,
    vcJwt: `header.payload.${STUB_SIGNATURE_STATUS}`,
    nextIndex: 0,
    capacity: DEFAULT_STATUS_LIST_CAPACITY,
    frozen: false,
    updatedVersion: 0,
    lastIssuedAt: new Date(),
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  };
}

/**
 * In-memory repository — exposes a `rows` map so individual tests can
 * seed any state and assert against the post-state. The real repository's
 * `allocateSlot` semantics (atomic increment + freeze-at-capacity) are
 * mirrored faithfully so the service paths look identical to production.
 */
class FakeRepository implements IStatusListRepository {
  rows = new Map<string, StatusListCredentialRow>();
  vcs = new Map<string, VcRevocationRow>();
  // Track creation order so `findActive` returns the most recent.
  private creationOrder: string[] = [];

  async findActive(): Promise<StatusListCredentialRow | null> {
    for (let i = this.creationOrder.length - 1; i >= 0; i -= 1) {
      const row = this.rows.get(this.creationOrder[i])!;
      if (!row.frozen) {
        return row;
      }
    }
    return null;
  }

  async findByListKey(_ctx: IContext, listKey: string): Promise<StatusListCredentialRow | null> {
    return [...this.rows.values()].find((r) => r.listKey === listKey) ?? null;
  }

  async findById(_ctx: IContext, id: string): Promise<StatusListCredentialRow | null> {
    return this.rows.get(id) ?? null;
  }

  async create(
    _ctx: IContext,
    input: { listKey: string; capacity: number; encodedList: Uint8Array; vcJwt: string },
  ): Promise<StatusListCredentialRow> {
    const id = `row-${this.rows.size + 1}`;
    const row = makeRow({
      id,
      listKey: input.listKey,
      capacity: input.capacity,
      encodedList: input.encodedList,
      vcJwt: input.vcJwt,
      createdAt: new Date(Date.now() + this.rows.size),
    });
    this.rows.set(id, row);
    this.creationOrder.push(id);
    return row;
  }

  async allocateSlot(
    _ctx: IContext,
    id: string,
  ): Promise<{ row: StatusListCredentialRow; allocatedIndex: number }> {
    const row = this.rows.get(id);
    if (!row) throw new Error(`row ${id} not found`);
    if (row.frozen) throw new Error("frozen");
    const allocatedIndex = row.nextIndex;
    const newNextIndex = allocatedIndex + 1;
    const willFill = newNextIndex >= row.capacity;
    const updated = { ...row, nextIndex: newNextIndex, frozen: row.frozen || willFill };
    this.rows.set(id, updated);
    return { row: updated, allocatedIndex };
  }

  async updateBitstring(
    _ctx: IContext,
    id: string,
    input: { encodedList: Uint8Array; vcJwt: string },
  ): Promise<StatusListCredentialRow> {
    const row = this.rows.get(id);
    if (!row) throw new Error(`row ${id} not found`);
    const updated = {
      ...row,
      encodedList: input.encodedList,
      vcJwt: input.vcJwt,
      updatedVersion: row.updatedVersion + 1,
      lastIssuedAt: new Date(),
    };
    this.rows.set(id, updated);
    return updated;
  }

  async findVcRequest(_ctx: IContext, id: string): Promise<VcRevocationRow | null> {
    return this.vcs.get(id) ?? null;
  }

  async markVcRevoked(_ctx: IContext, id: string): Promise<void> {
    // Just record the call — assertions inspect spy invocations directly.
    this.markVcRevokedCalls.push(id);
  }
  markVcRevokedCalls: string[] = [];
}

const ctx = {} as IContext;

describe("StatusListService", () => {
  let repo: FakeRepository;
  let service: StatusListService;

  beforeEach(() => {
    container.reset();
    repo = new FakeRepository();
    container.register("StatusListRepository", { useValue: repo });
    container.register("StatusListService", { useClass: StatusListService });
    service = container.resolve(StatusListService);
  });

  describe("allocateNextSlot", () => {
    it("bootstraps a new list on first call and returns slot 0", async () => {
      const slot = await service.allocateNextSlot(ctx);
      expect(slot.statusListIndex).toBe(0);
      expect(slot.listKey).toBe("1");
      expect(slot.statusListCredentialUrl).toBe(buildStatusListUrl("1"));
      expect(repo.rows.size).toBe(1);
      const row = [...repo.rows.values()][0];
      expect(row.nextIndex).toBe(1);
      expect(row.frozen).toBe(false);
    });

    it("appends to an existing active list and increments nextIndex", async () => {
      const first = await service.allocateNextSlot(ctx);
      const second = await service.allocateNextSlot(ctx);
      expect(first.statusListIndex).toBe(0);
      expect(second.statusListIndex).toBe(1);
      expect(second.listKey).toBe(first.listKey);
      expect(repo.rows.size).toBe(1);
    });

    it("freezes the active list at capacity and bootstraps a new list on next allocation", async () => {
      // Seed a tiny list near capacity so we can test rollover quickly.
      const tinyCapacity = 2;
      await repo.create(ctx, {
        listKey: "1",
        capacity: tinyCapacity,
        encodedList: emptyCompressed(tinyCapacity),
        vcJwt: "x.y.z",
      });

      const a = await service.allocateNextSlot(ctx);
      const b = await service.allocateNextSlot(ctx);
      expect(a.statusListIndex).toBe(0);
      expect(b.statusListIndex).toBe(1);

      // After 2 allocations the row should be frozen.
      const firstRow = [...repo.rows.values()].find((r) => r.listKey === "1")!;
      expect(firstRow.frozen).toBe(true);

      // Next allocation must roll into a fresh list.
      const c = await service.allocateNextSlot(ctx);
      expect(c.listKey).toBe("2");
      expect(c.statusListIndex).toBe(0);
      expect(repo.rows.size).toBe(2);
    });
  });

  describe("revokeVc", () => {
    it("flips the bit at the VC's statusListIndex and bumps updatedVersion", async () => {
      // First issue a slot so a list exists.
      const slot = await service.allocateNextSlot(ctx);
      // Seed the VC row that points at that slot.
      repo.vcs.set("vc-1", {
        id: "vc-1",
        statusListIndex: slot.statusListIndex,
        statusListCredential: slot.statusListCredentialUrl,
      });

      const before = [...repo.rows.values()][0];
      const versionBefore = before.updatedVersion;

      await service.revokeVc(ctx, { vcRequestId: "vc-1", reason: "test" });

      const after = [...repo.rows.values()][0];
      expect(after.updatedVersion).toBe(versionBefore + 1);
      expect(repo.markVcRevokedCalls).toContain("vc-1");

      // Decompress and verify the bit at index `slot.statusListIndex` is set.
      const decompressed = new Uint8Array(gunzipSync(Buffer.from(after.encodedList)));
      const byteIdx = Math.floor(slot.statusListIndex / 8);
      const bitOffset = slot.statusListIndex % 8;
      const mask = 0x80 >> bitOffset;
      expect((decompressed[byteIdx] & mask) !== 0).toBe(true);
    });

    it("throws when the VC has no statusListIndex (legacy / pre-§D)", async () => {
      repo.vcs.set("vc-legacy", {
        id: "vc-legacy",
        statusListIndex: null,
        statusListCredential: null,
      });
      await expect(service.revokeVc(ctx, { vcRequestId: "vc-legacy" })).rejects.toThrow(
        /no statusList wiring/,
      );
    });

    it("throws when the VC row does not exist", async () => {
      await expect(service.revokeVc(ctx, { vcRequestId: "missing" })).rejects.toThrow(/not found/);
    });
  });

  describe("buildStatusListVc", () => {
    it("returns the persisted VC JWT for an existing list", async () => {
      await service.allocateNextSlot(ctx);
      const jwt = await service.buildStatusListVc(ctx, "1");
      expect(jwt).not.toBeNull();
      expect(typeof jwt).toBe("string");
      const segments = (jwt as string).split(".");
      expect(segments).toHaveLength(3);
      expect(segments[2]).toBe(STUB_SIGNATURE_STATUS);
    });

    it("returns null for an unknown listKey", async () => {
      const jwt = await service.buildStatusListVc(ctx, "999");
      expect(jwt).toBeNull();
    });
  });
});

describe("buildStatusListVcPayload (pure function)", () => {
  it("emits the W3C StatusList2021Credential type, contexts, and gzipped+base64url encodedList", () => {
    const issuedAt = new Date("2026-05-10T12:00:00Z");
    // Round-trip: produce a gzipped bitstring with bit 5 set, then verify
    // that decoding the payload's `encodedList` yields the same bytes.
    const raw = new Uint8Array(2);
    raw[0] = 0b00000100; // bit index 5 set (per MSB-first ordering used in W3C)
    const compressed = gzipSync(Buffer.from(raw));
    const encodedListBase64Url = Buffer.from(compressed).toString("base64url");

    const payload = buildStatusListVcPayload({
      listUrl: buildStatusListUrl("1"),
      encodedListBase64Url,
      issuer: "did:web:api.civicship.app",
      issuedAt,
    });

    expect(payload["@context"]).toEqual([
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/vc/status-list/2021/v1",
    ]);
    expect(payload.type).toEqual(["VerifiableCredential", "StatusList2021Credential"]);
    expect(payload.id).toBe("https://api.civicship.app/credentials/status/1.jwt");
    expect(payload.issuanceDate).toBe(issuedAt.toISOString());

    const subject = payload.credentialSubject as Record<string, unknown>;
    expect(subject.type).toBe("StatusList2021");
    expect(subject.statusPurpose).toBe("revocation");
    expect(subject.encodedList).toBe(encodedListBase64Url);

    // Decode round-trip: gzipped bytes match the original bitstring.
    const decoded = Buffer.from(subject.encodedList as string, "base64url");
    const recovered = new Uint8Array(gunzipSync(decoded));
    expect(recovered[0]).toBe(raw[0]);
  });
});
