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

import { container, injectable } from "tsyringe";
import { Prisma, VcFormat, VcIssuanceStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import type { IVcIssuanceRepository } from "@/application/domain/credential/vcIssuance/data/interface";
import type {
  CreateVcIssuanceInput,
  VcFormatValue,
  VcIssuanceRow,
  VcStatusValue,
} from "@/application/domain/credential/vcIssuance/data/type";

/**
 * Build a `VcIssuanceRow` (the application-layer view) from the Prisma
 * persistence result and the original input. The local row shape carries
 * `issuerDid` / `subjectDid` for downstream consumers even though the
 * underlying schema does not store them as columns — they are encoded in
 * the JWT payload and round-tripped via the input here.
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
  issuerDid: string,
  subjectDid: string,
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
  private getIssuer(): PrismaClientIssuer {
    return container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  }

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
  async findById(ctx: IContext, id: string): Promise<VcIssuanceRow | null> {
    const issuer = ctx.issuer || this.getIssuer();
    const persisted = await issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.findUnique({ where: { id } });
    });
    if (!persisted) return null;
    const { issuerDid, subjectDid } = decodeIssuerSubjectFromJwt(persisted.vcJwt);
    return toRow(persisted, issuerDid, subjectDid);
  }

  /**
   * Return every VC issuance row owned by `userId`, newest first. Issuer /
   * subject DIDs are recovered from each row's `vcJwt` payload (same
   * approach as `findById`) since the schema does not store them as
   * columns.
   */
  async findByUserId(ctx: IContext, userId: string): Promise<VcIssuanceRow[]> {
    const issuer = ctx.issuer || this.getIssuer();
    const persisted = await issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    });
    return persisted.map((row) => {
      const { issuerDid, subjectDid } = decodeIssuerSubjectFromJwt(row.vcJwt);
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
      : await (ctx.issuer || this.getIssuer()).public(ctx, (innerTx) =>
          innerTx.vcIssuanceRequest.create({ data }),
        );

    return toRow(persisted, input.issuerDid, input.subjectDid);
  }
}

/**
 * Decode the JWT payload segment to recover `issuer` and
 * `credentialSubject.id` for `findById`. Returns empty strings when the
 * JWT is missing or malformed — `findById` callers that depend on those
 * fields should treat them as best-effort for legacy / corrupt rows.
 */
function decodeIssuerSubjectFromJwt(vcJwt: string | null): {
  issuerDid: string;
  subjectDid: string;
} {
  if (!vcJwt) return { issuerDid: "", subjectDid: "" };
  const segments = vcJwt.split(".");
  if (segments.length < 2) return { issuerDid: "", subjectDid: "" };
  try {
    const payload = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8")) as {
      issuer?: unknown;
      credentialSubject?: { id?: unknown };
    };
    const issuerDid = typeof payload.issuer === "string" ? payload.issuer : "";
    const subjectDid =
      payload.credentialSubject && typeof payload.credentialSubject.id === "string"
        ? payload.credentialSubject.id
        : "";
    return { issuerDid, subjectDid };
  } catch {
    return { issuerDid: "", subjectDid: "" };
  }
}
