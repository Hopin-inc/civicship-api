/**
 * Prisma-backed repository for `VcIssuanceRequest` (Phase-1 redesign shape).
 *
 * Persistence rules (§5.2.2):
 *   - VC body is `COMPLETED` immediately on insert — anchor confirmation
 *     happens out-of-band via the weekly batch (§5.3.1) and patches
 *     `vcAnchorId` / `anchorLeafIndex` later.
 *   - `vcJwt` carries the canonical issuer / subject DIDs in its payload
 *     segment, so the row does NOT redundantly persist those fields. The
 *     schema's `claims` Json column is required by the legacy IDENTUS flow
 *     and we set it to an empty object `{}` for Phase-1 internal JWTs (the
 *     payload is fully reconstructable from `vcJwt`).
 *   - StatusList wiring (§D) lands in Phase 1 step 9; until then
 *     `statusListIndex` / `statusListCredential` flow through as supplied
 *     (typically `null`).
 *
 * Transaction handling follows the project-wide pattern (CLAUDE.md
 * "Transaction Handling Pattern"): when `tx` is supplied, the write happens
 * inside that transaction; otherwise we open an issuer-scoped public
 * transaction.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (VcIssuanceRequest schema)
 *   docs/report/did-vc-internalization.md §5.2.2 (VcIssuanceService flow)
 */

import { inject, injectable } from "tsyringe";
import { Prisma, VcFormat, VcIssuanceStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import type { IVcIssuanceRepository } from "@/application/domain/credential/vcIssuance/data/interface";
import type {
  CreateVcIssuanceInput,
  VcAnchorRow,
  VcFormatValue,
  VcIssuanceRow,
  VcJwtLeaf,
  VcStatusValue,
} from "@/application/domain/credential/vcIssuance/data/type";

/**
 * Build a `VcIssuanceRow` (the application-layer view) from the Prisma
 * persistence result and the original input. The local row shape carries
 * `issuerDid` / `subjectDid` for downstream consumers even though the
 * underlying schema does not store them as columns — they are encoded in
 * the JWT payload and round-tripped via the input here.
 *
 * `issuerDid` is `string | null`: `findById` recovers it by parsing the
 * JWT payload and that parse can fail (legacy / corrupt rows). `null`
 * forces consumers to handle the missing-issuer case explicitly rather
 * than silently treating an empty string as a valid DID.
 */
function toRow(
  persisted: {
    id: string;
    userId: string;
    evaluationId: string;
    vcFormat: VcFormat;
    vcJwt: string | null;
    statusListIndex: number | null;
    statusListCredential: string | null;
    vcAnchorId: string | null;
    anchorLeafIndex: number | null;
    status: VcIssuanceStatus;
    createdAt: Date;
    completedAt: Date | null;
    revokedAt: Date | null;
  },
  issuerDid: string | null,
  subjectDid: string | null,
): VcIssuanceRow {
  return {
    id: persisted.id,
    userId: persisted.userId,
    evaluationId: persisted.evaluationId,
    issuerDid,
    subjectDid,
    vcFormat: persisted.vcFormat as VcFormatValue,
    vcJwt: persisted.vcJwt ?? "",
    statusListIndex: persisted.statusListIndex,
    statusListCredential: persisted.statusListCredential,
    vcAnchorId: persisted.vcAnchorId,
    anchorLeafIndex: persisted.anchorLeafIndex,
    status: persisted.status as VcStatusValue,
    createdAt: persisted.createdAt,
    completedAt: persisted.completedAt,
    revokedAt: persisted.revokedAt,
  };
}

@injectable()
export default class VcIssuanceRepository implements IVcIssuanceRepository {
  constructor(@inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer) {}

  /**
   * `findById` is not yet wired into a caller path in Phase 1 step 7; the
   * implementation below is the canonical Prisma lookup so the upcoming
   * GraphQL resolver (Phase 1 step 8) can use it directly. The row's
   * `issuerDid` / `subjectDid` are recovered from the JWT payload — for
   * Phase-1 internal JWTs the issuer is always `did:web:api.civicship.app`
   * (§B) and the subject is `did:web:api.civicship.app:users:<userId>`,
   * but to keep this method purely persistence-bound we decode the JWT
   * payload's `issuer` / `credentialSubject.id` instead.
   */
  async findById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<VcIssuanceRow | null> {
    // When a caller-supplied `tx` is present we MUST read on it so the
    // lookup observes in-progress writes from the same transaction
    // (Phase 1.5: the revoke flow stamps `revokedAt` then re-reads the
    // row to surface the new timestamp through the GraphQL response).
    // Without a `tx`, fall back to an issuer-scoped public transaction
    // so RLS stays applied for the standalone query path.
    const persisted = tx
      ? await tx.vcIssuanceRequest.findUnique({ where: { id } })
      : await this.issuer.public(ctx, (innerTx) =>
          innerTx.vcIssuanceRequest.findUnique({ where: { id } }),
        );
    if (!persisted) return null;
    const { issuerDid, subjectDid } = decodeIssuerSubjectFromJwt(persisted.vcJwt, persisted.id);
    return toRow(persisted, issuerDid, subjectDid);
  }

  /**
   * Return every VC issuance row owned by `userId`, newest first. Issuer /
   * subject DIDs are recovered from each row's `vcJwt` payload (same
   * approach as `findById`) since the schema does not store them as
   * columns.
   */
  async findByUserId(ctx: IContext, userId: string): Promise<VcIssuanceRow[]> {
    const persisted = await this.issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    });
    return persisted.map((row) => {
      const { issuerDid, subjectDid } = decodeIssuerSubjectFromJwt(row.vcJwt, row.id);
      return toRow(row, issuerDid, subjectDid);
    });
  }

  /**
   * §14.2 / §E — DID DEACTIVATE cascade. Returns every VC issuance row
   * for `userId` whose `revokedAt` is still null, oldest first so the
   * caller can revoke deterministically (matters for log ordering when a
   * user has many VCs).
   *
   * Uses the caller-supplied `tx` when present so the read shares the
   * snapshot used by the surrounding StatusList writes; otherwise opens
   * an issuer-scoped public transaction so RLS still applies.
   */
  async findActiveByUserId(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<VcIssuanceRow[]> {
    const persisted = tx
      ? await tx.vcIssuanceRequest.findMany({
          where: { userId, revokedAt: null },
          orderBy: { createdAt: "asc" },
        })
      : await this.issuer.public(ctx, (innerTx) =>
          innerTx.vcIssuanceRequest.findMany({
            where: { userId, revokedAt: null },
            orderBy: { createdAt: "asc" },
          }),
        );
    return persisted.map((row) => {
      const { issuerDid, subjectDid } = decodeIssuerSubjectFromJwt(row.vcJwt, row.id);
      return toRow(row, issuerDid, subjectDid);
    });
  }

  async create(
    ctx: IContext,
    input: CreateVcIssuanceInput,
    tx?: Prisma.TransactionClient,
  ): Promise<VcIssuanceRow> {
    if (!input.evaluationId) {
      // Schema requires `evaluationId` (NOT NULL, @unique) — surface the
      // mismatch with a clear error rather than letting Prisma throw with
      // an opaque constraint message.
      throw new Error("VcIssuanceRepository.create: evaluationId is required (schema constraint)");
    }
    const data: Prisma.VcIssuanceRequestCreateInput = {
      vcFormat: input.vcFormat as VcFormat,
      vcJwt: input.vcJwt,
      status: input.status as VcIssuanceStatus,
      // §D StatusList wiring is patched in by Phase 1 step 9; pass through
      // whatever the caller provided (typically `null` for now).
      statusListIndex: input.statusListIndex ?? null,
      statusListCredential: input.statusListCredential ?? null,
      // The legacy `claims` column is required by the schema but is not
      // used by the redesigned JWT flow — the canonical claims live in the
      // `vcJwt` payload. We persist `{}` so the NOT-NULL constraint holds
      // without duplicating data.
      claims: {} as Prisma.InputJsonValue,
      // §5.2.2: VC body is COMPLETED before chain anchor; stamp the
      // completion timestamp so downstream consumers do not need to infer
      // "completed = createdAt" implicitly.
      completedAt: input.status === "COMPLETED" ? new Date() : null,
      user: { connect: { id: input.userId } },
      evaluation: { connect: { id: input.evaluationId } },
    };

    const persisted = tx
      ? await tx.vcIssuanceRequest.create({ data })
      : await this.issuer.public(ctx, (innerTx) => innerTx.vcIssuanceRequest.create({ data }));

    return toRow(persisted, input.issuerDid, input.subjectDid);
  }

  /**
   * Read the `VcAnchor` row backing a confirmed batch. Uses
   * `issuer.internal()` for the same reason `UserDidAnchorRepository`
   * does on its public-route path: the `/vc/:vcId/inclusion-proof`
   * endpoint is unauthenticated and there is no community-scoped RLS
   * decision to apply to global anchor metadata.
   */
  async findVcAnchorById(ctx: IContext, vcAnchorId: string): Promise<VcAnchorRow | null> {
    const persisted = await this.issuer.internal((tx) =>
      tx.vcAnchor.findUnique({
        where: { id: vcAnchorId },
        select: {
          id: true,
          rootHash: true,
          leafIds: true,
          chainTxHash: true,
          blockHeight: true,
          status: true,
        },
      }),
    );
    if (!persisted) return null;
    return persisted;
  }

  /**
   * Bulk-read VC JWT segments for a list of `VcIssuanceRequest.id`s.
   * Mirrors `AnchorBatchRepository.findVcJwtsByVcIssuanceRequestIds` but
   * lives in the vcIssuance domain because the read consumer (inclusion-
   * proof endpoint) is here. Callers MUST sort the result themselves
   * (ASCII byte order, §5.1.7) before computing the proof — the
   * repository layer has no business deciding leaf order.
   */
  async findVcJwtsByIds(ctx: IContext, vcIssuanceRequestIds: string[]): Promise<VcJwtLeaf[]> {
    if (vcIssuanceRequestIds.length === 0) return [];
    const rows = await this.issuer.internal((tx) =>
      tx.vcIssuanceRequest.findMany({
        where: { id: { in: vcIssuanceRequestIds } },
        select: { id: true, vcJwt: true },
      }),
    );
    // Do NOT silently filter rows with missing/empty vcJwt — Merkle root
    // depends on the exact leaf set used at anchor time; dropping a leaf
    // here invalidates every proof in the batch, not just the affected
    // one. Service layer enforces the integrity invariant
    // (leaves.length === anchor.leafIds.length).
    return rows.map((r) => ({
      vcIssuanceRequestId: r.id,
      vcJwt: typeof r.vcJwt === "string" ? r.vcJwt : "",
    }));
  }
}

/**
 * Decode the JWT payload segment to recover `issuer` and
 * `credentialSubject.id` for `findById`. Returns `null` for whichever
 * field is missing or unparseable so downstream callers must handle the
 * absence explicitly (silent empty strings hid corrupt-row issues
 * previously). Also emits a structured warn log so operators can surface
 * legacy / corrupt rows in monitoring without paging on read traffic.
 */
function decodeIssuerSubjectFromJwt(
  vcJwt: string | null,
  vcRequestId: string,
): {
  issuerDid: string | null;
  subjectDid: string | null;
} {
  if (!vcJwt) {
    logger.warn("[VcIssuanceRepository] missing vcJwt; cannot decode issuer/subject", {
      vcRequestId,
    });
    return { issuerDid: null, subjectDid: null };
  }
  const segments = vcJwt.split(".");
  if (segments.length < 2) {
    logger.warn("[VcIssuanceRepository] malformed vcJwt (segment count)", {
      vcRequestId,
      segmentCount: segments.length,
    });
    return { issuerDid: null, subjectDid: null };
  }
  try {
    const payload = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8")) as {
      issuer?: unknown;
      credentialSubject?: { id?: unknown };
    };
    const issuerDid = typeof payload.issuer === "string" ? payload.issuer : null;
    const subjectDid =
      payload.credentialSubject && typeof payload.credentialSubject.id === "string"
        ? payload.credentialSubject.id
        : null;
    return { issuerDid, subjectDid };
  } catch (error) {
    logger.warn("[VcIssuanceRepository] failed to decode VC JWT", {
      vcRequestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { issuerDid: null, subjectDid: null };
  }
}
