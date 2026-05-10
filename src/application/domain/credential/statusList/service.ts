/**
 * `StatusListService` — application-layer entry point for civicship's
 * VC revocation list per W3C Bitstring Status List 2021 (§D / §5.2.4).
 *
 * Three responsibilities:
 *
 *   1. `allocateNextSlot()` — reserve the next bit index for a freshly
 *      issued VC. Bootstraps a new list on first call, rolls over on
 *      capacity (§7.3).
 *
 *   2. `revokeVc({ vcRequestId })` — flip the bit corresponding to a
 *      previously issued VC, re-encode + re-sign the list VC, and stamp
 *      the VC issuance row with `revokedAt`.
 *
 *   3. `buildStatusListVc(statusListId)` — return the latest list-VC JWT
 *      so the public HTTPS endpoint (`/credentials/status/:listKey.jwt`)
 *      can serve it. Frozen lists keep responding (past VC verifiers fetch
 *      them indefinitely, §7.3).
 *
 * Encoding (§7.2): the bitstring is GZIP-compressed (RFC 1952) then
 * base64url-encoded inside `credentialSubject.encodedList`. The compressed
 * bytes are persisted to the `encoded_list` BYTEA column so we don't
 * re-zip on every read; the base64url wrapper is only applied at JWT
 * build time.
 *
 * KMS signing: production signing lives in `IssuerDidService.signWithActiveKey`
 * (sibling PR). Until that lands the JWT signature segment is the constant
 * `STUB_SIGNATURE_STATUS` so verifiers reject it (it is not a valid
 * base64url signature) and so we can grep every stub site post-hoc.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (StatusListCredential schema)
 *   docs/report/did-vc-internalization.md §5.2.4 (this service)
 *   docs/report/did-vc-internalization.md §7     (Revocation lifecycle)
 *   docs/report/did-vc-internalization.md §D     (BitstringStatusList spec)
 *   https://www.w3.org/TR/vc-status-list/        (Status List 2021)
 */

import { gzipSync } from "node:zlib";
import { inject, injectable } from "tsyringe";
import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import type { IStatusListRepository } from "@/application/domain/credential/statusList/data/interface";
import type {
  AllocatedSlot,
  StatusListCredentialRow,
} from "@/application/domain/credential/statusList/data/type";
import { CIVICSHIP_ISSUER_DID } from "@/application/domain/credential/vcIssuance/service";

/**
 * Public API host. Hard-coded per §B / §5.4 — civicship is a single-issuer
 * platform so the host is a constant. Tests can override via env if needed
 * later (none today).
 */
export const STATUS_LIST_BASE_URL = "https://api.civicship.app/credentials/status";

/**
 * URL builder for `credentialStatus.statusListCredential`. Pure so the
 * VC issuance pipeline can compute the URL deterministically without
 * touching the service.
 *
 * Endpoint format follows the task brief: `/credentials/status/{listKey}.jwt`.
 * The `.jwt` suffix mirrors the `application/jwt` Content-Type returned by
 * the router (some Bitstring resolvers key off the suffix when the response
 * type is missing).
 */
export function buildStatusListUrl(listKey: string): string {
  return `${STATUS_LIST_BASE_URL}/${listKey}.jwt`;
}

/**
 * Schema-default capacity for a Bitstring Status List row (§4.1 — `capacity`
 * defaults to 131072 bits = 16 KiB uncompressed). Used when bootstrapping a
 * brand-new list. The task brief mentions 16384 (2^14) as a smaller option;
 * we keep the schema default 131072 so the bytea column matches the migration
 * and the design's "13 years per list" sizing assumption holds.
 */
export const DEFAULT_STATUS_LIST_CAPACITY = 131_072;

/**
 * Stub signature for the StatusList VC. Distinct from the VC issuance
 * stub so post-hoc grep can pin which stub a JWT came from. Replaced with
 * a real KMS-backed signature once `IssuerDidService.signWithActiveKey`
 * lands (sibling PR).
 */
export const STUB_SIGNATURE_STATUS = "stub-status-list-not-signed";

/**
 * Build the standard W3C contexts + types for a `StatusList2021Credential`
 * (per §D — civicship runs the legacy 2021 vocabulary, which is the same
 * shape as Bitstring Status List).
 */
const STATUS_LIST_CONTEXT = [
  "https://www.w3.org/2018/credentials/v1",
  "https://w3id.org/vc/status-list/2021/v1",
];

const STATUS_LIST_TYPE = ["VerifiableCredential", "StatusList2021Credential"];

const CREDENTIAL_SUBJECT_TYPE = "StatusList2021";

/**
 * Encode a JSON-serialisable object as a base64url-encoded JWT segment.
 * Mirrors the helper in `vcIssuance/service.ts` — kept duplicated rather
 * than exported to keep service modules self-contained.
 */
function base64urlEncodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

/**
 * Encode raw bytes as base64url. Used for the `encodedList` field which
 * the spec mandates as the GZIP'd bitstring in base64url form.
 */
function base64urlEncodeBytes(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

/**
 * Compress the raw bitstring with GZIP (RFC 1952). The DB column already
 * holds the gzipped form so this is only used at bootstrap.
 */
function gzipBitstring(bytes: Uint8Array): Uint8Array {
  const out = gzipSync(Buffer.from(bytes));
  return out instanceof Uint8Array ? out : new Uint8Array(out);
}

/**
 * Allocate an empty bitstring sized for `capacity` bits (rounded up to a
 * full byte). Each bit defaults to 0 (= "not revoked") per §7.2.
 */
function emptyBitstring(capacity: number): Uint8Array {
  return new Uint8Array(Math.ceil(capacity / 8));
}

/**
 * Flip the `index`-th bit to 1 in `bitstring`. Mutates in place; the
 * caller is responsible for cloning if it needs to keep the original.
 *
 * Bit ordering follows the W3C Status List 2021 convention: bit 0 lives
 * in the most significant bit of byte 0, bit 1 in the next-most, etc.
 * (See § "Bitstring Generation Algorithm".)
 */
function setBit(bitstring: Uint8Array, index: number): void {
  const byteIdx = Math.floor(index / 8);
  const bitOffset = index % 8;
  const mask = 0x80 >> bitOffset;
  bitstring[byteIdx] |= mask;
}

/**
 * Build the W3C VC payload for the StatusList itself. Pure so tests can
 * snapshot the JWT shape without touching the service.
 */
export function buildStatusListVcPayload(input: {
  listUrl: string;
  encodedListBase64Url: string;
  issuer: string;
  issuedAt: Date;
}): Record<string, unknown> {
  return {
    "@context": STATUS_LIST_CONTEXT,
    id: input.listUrl,
    type: STATUS_LIST_TYPE,
    issuer: input.issuer,
    issuanceDate: input.issuedAt.toISOString(),
    credentialSubject: {
      // Per §D / W3C the subject id is the list URL with a "#list" anchor.
      id: `${input.listUrl}#list`,
      type: CREDENTIAL_SUBJECT_TYPE,
      statusPurpose: "revocation",
      // The bitstring is *already* gzipped; just base64url it.
      encodedList: input.encodedListBase64Url,
    },
  };
}

/**
 * Render a JWT from header/payload/signature. Currently signature is a
 * stub; swap to KMS once available.
 */
function renderJwt(payload: Record<string, unknown>, kid: string): string {
  const header = base64urlEncodeJson({
    alg: "EdDSA",
    typ: "JWT",
    kid,
  });
  const body = base64urlEncodeJson(payload);
  // TODO(phase1-final): replace `STUB_SIGNATURE_STATUS` with the output of
  // `IssuerDidService.signWithActiveKey(`${header}.${body}`)`. The function
  // signature lives in the sibling KMS PR; tests assert on the stub
  // marker today and will move to a structural shape check once signing
  // lands.
  return `${header}.${body}.${STUB_SIGNATURE_STATUS}`;
}

@injectable()
export default class StatusListService {
  constructor(
    @inject("StatusListRepository")
    private readonly repository: IStatusListRepository,
  ) {}

  /**
   * §5.2.4 — reserve the next bit index for a freshly issued VC.
   *
   * Behaviour (in order):
   *   1. Find the active (non-frozen) list. If none → bootstrap a new one.
   *   2. Atomically increment its `nextIndex`. The repository freezes the
   *      row in the same UPDATE if the increment lands at capacity.
   *   3. If the active list was already at capacity (rare race), bootstrap
   *      a fresh list and recurse once.
   *
   * Returns the slot metadata that the VC issuance pipeline embeds into
   * `credentialStatus`.
   */
  async allocateNextSlot(ctx: IContext, tx?: Prisma.TransactionClient): Promise<AllocatedSlot> {
    const active = await this.repository.findActive(ctx, tx);
    const target = active ?? (await this.bootstrapNewList(ctx, tx));

    if (target.nextIndex >= target.capacity) {
      // Capacity already reached — `findActive` should have skipped this
      // row but a concurrent allocation might have raced us through. Mark
      // it frozen explicitly via the bitstring update (no-op bitstring
      // change, the row's `frozen` is set by `allocateSlot` below) and
      // bootstrap a fresh list instead.
      logger.info("[StatusListService] capacity reached, rolling list", {
        listKey: target.listKey,
        capacity: target.capacity,
      });
      const fresh = await this.bootstrapNewList(ctx, tx);
      const allocation = await this.repository.allocateSlot(ctx, fresh.id, tx);
      return this.buildAllocatedSlot(allocation.row, allocation.allocatedIndex);
    }

    const allocation = await this.repository.allocateSlot(ctx, target.id, tx);
    return this.buildAllocatedSlot(allocation.row, allocation.allocatedIndex);
  }

  /**
   * §5.2.4 — flip the revocation bit for a previously issued VC and
   * persist + re-sign the list.
   *
   * Throws if:
   *   - the VC row does not exist;
   *   - the VC has no `statusListIndex` (it was issued before §D wiring);
   *   - the referenced list cannot be found (data corruption — surfaces a
   *     500 in the router).
   */
  async revokeVc(
    ctx: IContext,
    input: { vcRequestId: string; reason?: string },
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const vc = await this.repository.findVcRequest(ctx, input.vcRequestId, tx);
    if (!vc) {
      throw new Error(
        `StatusListService.revokeVc: VC issuance request ${input.vcRequestId} not found.`,
      );
    }
    if (vc.statusListIndex === null || vc.statusListCredential === null) {
      throw new Error(
        `StatusListService.revokeVc: VC ${input.vcRequestId} has no statusList wiring (issued pre-§D).`,
      );
    }

    // The VC stores the list URL, not the listKey. Recover the listKey by
    // stripping the prefix + suffix. Falling back to "the listKey is the
    // path's last segment without `.jwt`" keeps us robust if the URL
    // origin ever moves (test envs, etc).
    const listKey = parseListKeyFromUrl(vc.statusListCredential);
    const list = await this.repository.findByListKey(ctx, listKey, tx);
    if (!list) {
      throw new Error(
        `StatusListService.revokeVc: status list ${listKey} (referenced by VC ${input.vcRequestId}) not found.`,
      );
    }

    // Decompress, flip, re-compress.
    const { gunzipSync } = await import("node:zlib");
    const decompressedBuf = gunzipSync(Buffer.from(list.encodedList));
    const decompressed = new Uint8Array(decompressedBuf);
    setBit(decompressed, vc.statusListIndex);
    const recompressed = gzipBitstring(decompressed);

    // Re-sign the list VC and persist the new bytes + JWT.
    const issuedAt = new Date();
    const vcJwt = this.signListVc(list, recompressed, issuedAt);

    await this.repository.updateBitstring(ctx, list.id, { encodedList: recompressed, vcJwt }, tx);
    await this.repository.markVcRevoked(ctx, input.vcRequestId, { reason: input.reason }, tx);

    logger.debug("[StatusListService] revokeVc", {
      vcRequestId: input.vcRequestId,
      listKey: list.listKey,
      statusListIndex: vc.statusListIndex,
    });
  }

  /**
   * §5.4 — return the most recently signed list VC JWT. Frozen lists keep
   * responding (past VC verifiers must continue resolving the URL).
   *
   * Lookup is by `listKey` (the path-segment id), not Prisma `id`. We
   * accept the listKey here because the public router only sees the path,
   * and persisting an internal cuid → listKey mapping in the URL would
   * leak DB ids.
   */
  async buildStatusListVc(ctx: IContext, listKey: string): Promise<string | null> {
    const list = await this.repository.findByListKey(ctx, listKey);
    if (!list) {
      return null;
    }
    return list.vcJwt;
  }

  /**
   * Bootstrap helper used by `allocateNextSlot` when no active list
   * exists or capacity rolls over. Generates the next listKey by
   * counting existing rows + 1 (sufficient for the volumes we expect;
   * year ~10,000 issuances → 1 list every 13 years).
   */
  private async bootstrapNewList(
    ctx: IContext,
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow> {
    // Use timestamp-derived `listKey` so the URL is human-readable and
    // strictly increasing without requiring a separate sequence table.
    // The default capacity matches the schema default, keeping config
    // surface zero today.
    const listKey = await this.computeNextListKey(ctx, tx);
    const capacity = DEFAULT_STATUS_LIST_CAPACITY;
    const bitstring = emptyBitstring(capacity);
    const compressed = gzipBitstring(bitstring);

    // Build a placeholder VC so the column is non-null (schema requires
    // it). The first revocation re-signs it with the actual bit-set.
    const issuedAt = new Date();
    const vcJwt = this.signBootstrapVc(listKey, compressed, issuedAt);

    return this.repository.create(ctx, { listKey, capacity, encodedList: compressed, vcJwt }, tx);
  }

  /**
   * Compute the next sequential listKey. Counts existing rows because
   * the row count is small (1-2 forever per §7.3) and we don't have a
   * dedicated sequence table. The CAS happens at the unique constraint
   * on `list_key` — duplicate-key collisions surface as 500s, which is
   * fine for the bootstrap path (it's exercised at most once per ~13
   * years per §7.3).
   */
  private async computeNextListKey(ctx: IContext, tx?: Prisma.TransactionClient): Promise<string> {
    // Walk listKey 1..N until we find a free slot. With ≤ 2 lists in
    // production the loop terminates in O(2). A bounded iteration count
    // (1024) prevents `S2189` (no truly infinite loop) while still
    // covering pathological growth.
    for (let candidate = 1; candidate < 1024; candidate += 1) {
      const key = String(candidate);
      const existing = await this.repository.findByListKey(ctx, key, tx);
      if (!existing) {
        return key;
      }
    }
    throw new Error(
      "StatusListService.computeNextListKey: 1024 lists exhausted — a real sequence is overdue.",
    );
  }

  /**
   * Sign a list VC. Same path used at bootstrap and at each revocation;
   * the only difference is which bytes go into `encodedList`.
   */
  private signListVc(
    list: StatusListCredentialRow,
    compressedBitstring: Uint8Array,
    issuedAt: Date,
  ): string {
    const listUrl = buildStatusListUrl(list.listKey);
    const payload = buildStatusListVcPayload({
      listUrl,
      encodedListBase64Url: base64urlEncodeBytes(compressedBitstring),
      issuer: CIVICSHIP_ISSUER_DID,
      issuedAt,
    });
    return renderJwt(payload, `${CIVICSHIP_ISSUER_DID}#stub`);
  }

  /**
   * Bootstrap-time signing: same as `signListVc` but operates on a
   * listKey rather than a row (the row doesn't exist yet at bootstrap
   * time). Kept separate to avoid a "fake row" hack in the bootstrap
   * path.
   */
  private signBootstrapVc(
    listKey: string,
    compressedBitstring: Uint8Array,
    issuedAt: Date,
  ): string {
    const listUrl = buildStatusListUrl(listKey);
    const payload = buildStatusListVcPayload({
      listUrl,
      encodedListBase64Url: base64urlEncodeBytes(compressedBitstring),
      issuer: CIVICSHIP_ISSUER_DID,
      issuedAt,
    });
    return renderJwt(payload, `${CIVICSHIP_ISSUER_DID}#stub`);
  }

  /**
   * Pack a `StatusListCredentialRow` + index into the public DTO. Pulled
   * out so allocation paths stay flat.
   */
  private buildAllocatedSlot(row: StatusListCredentialRow, allocatedIndex: number): AllocatedSlot {
    return {
      statusListId: row.id,
      listKey: row.listKey,
      statusListIndex: allocatedIndex,
      statusListCredentialUrl: buildStatusListUrl(row.listKey),
    };
  }
}

/**
 * Strip `STATUS_LIST_BASE_URL/` prefix and `.jwt` suffix to recover the
 * listKey. Returns the input unchanged (minus suffix) if the prefix is
 * unknown — keeps tests / non-prod hosts working without bespoke env wiring.
 */
function parseListKeyFromUrl(url: string): string {
  const trimmed = url.endsWith(".jwt") ? url.slice(0, -".jwt".length) : url;
  const lastSlash = trimmed.lastIndexOf("/");
  return lastSlash >= 0 ? trimmed.slice(lastSlash + 1) : trimmed;
}
