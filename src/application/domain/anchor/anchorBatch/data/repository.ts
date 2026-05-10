/**
 * AnchorBatchRepository.
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §5.2.3 (anchor.repository.ts)
 *   docs/report/did-vc-internalization.md §5.3.1 (idempotency / CAS)
 */

import { container, injectable } from "tsyringe";
import { AnchorStatus, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IAnchorBatchRepository } from "@/application/domain/anchor/anchorBatch/data/interface";
import {
  AnchorBatchPendingSet,
  PendingTransactionAnchor,
  PendingUserDidAnchor,
  PendingVcAnchor,
  PreviousAnchorChainTx,
  VcJwtLeaf,
} from "@/application/domain/anchor/anchorBatch/data/type";

@injectable()
export default class AnchorBatchRepository implements IAnchorBatchRepository {
  private getIssuer(): PrismaClientIssuer {
    return container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  }

  async findExistingBatchTransactionAnchors(
    ctx: IContext,
    batchId: string,
  ): Promise<PendingTransactionAnchor[]> {
    const issuer = ctx.issuer ?? this.getIssuer();
    return issuer.internal((tx) =>
      tx.transactionAnchor.findMany({
        where: { batchId },
        select: TX_ANCHOR_SELECT,
      }),
    );
  }

  async getBatchTerminalStatus(ctx: IContext, batchId: string): Promise<AnchorStatus | null> {
    const issuer = ctx.issuer ?? this.getIssuer();
    const rows = await issuer.internal((tx) =>
      tx.transactionAnchor.findMany({
        where: { batchId },
        select: { status: true },
      }),
    );
    if (rows.length === 0) return null;
    // 1 batch 内に異なる status が混在することは通常ないが、
    // 「終端ステータス」の判定として SUBMITTED / CONFIRMED / FAILED が
    // 1 つでも含まれていれば早期 return 対象とする。
    const statuses = new Set(rows.map((r) => r.status));
    if (statuses.has(AnchorStatus.CONFIRMED)) return AnchorStatus.CONFIRMED;
    if (statuses.has(AnchorStatus.SUBMITTED)) return AnchorStatus.SUBMITTED;
    if (statuses.has(AnchorStatus.FAILED)) return AnchorStatus.FAILED;
    return AnchorStatus.PENDING;
  }

  async findPendingAnchors(ctx: IContext): Promise<AnchorBatchPendingSet> {
    const issuer = ctx.issuer ?? this.getIssuer();
    return issuer.internal(async (tx) => {
      const [transactionAnchors, vcAnchors, userDidAnchors] = await Promise.all([
        tx.transactionAnchor.findMany({
          where: { status: AnchorStatus.PENDING, batchId: null },
          select: TX_ANCHOR_SELECT,
        }),
        tx.vcAnchor.findMany({
          where: { status: AnchorStatus.PENDING, batchId: null },
          select: VC_ANCHOR_SELECT,
        }),
        tx.userDidAnchor.findMany({
          where: { status: AnchorStatus.PENDING, batchId: null },
          select: USER_DID_ANCHOR_SELECT,
        }),
      ]);
      return {
        transactionAnchors,
        vcAnchors,
        userDidAnchors,
      };
    });
  }

  async findVcJwtsByVcIssuanceRequestIds(
    ctx: IContext,
    vcIssuanceRequestIds: string[],
  ): Promise<VcJwtLeaf[]> {
    if (vcIssuanceRequestIds.length === 0) return [];
    const issuer = ctx.issuer ?? this.getIssuer();
    const rows = await issuer.internal((tx) =>
      tx.vcIssuanceRequest.findMany({
        where: { id: { in: vcIssuanceRequestIds } },
        select: { id: true, vcJwt: true },
      }),
    );
    return rows
      .filter(
        (r): r is { id: string; vcJwt: string } =>
          typeof r.vcJwt === "string" && r.vcJwt.length > 0,
      )
      .map((r) => ({ vcIssuanceRequestId: r.id, vcJwt: r.vcJwt }));
  }

  async findPreviousAnchorChainTxHashes(
    ctx: IContext,
    previousAnchorIds: string[],
  ): Promise<PreviousAnchorChainTx[]> {
    if (previousAnchorIds.length === 0) return [];
    const issuer = ctx.issuer ?? this.getIssuer();
    const rows = await issuer.internal((tx) =>
      tx.userDidAnchor.findMany({
        where: { id: { in: previousAnchorIds } },
        select: { id: true, chainTxHash: true },
      }),
    );
    return rows.map((r) => ({ id: r.id, chainTxHash: r.chainTxHash }));
  }

  async claimPendingAnchors(
    ctx: IContext,
    args: {
      batchId: string;
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
  ): Promise<{
    transactionAnchors: number;
    vcAnchors: number;
    userDidAnchors: number;
  }> {
    const issuer = ctx.issuer ?? this.getIssuer();
    return issuer.internal(async (tx) => {
      const txRes = args.transactionAnchorIds.length
        ? await tx.transactionAnchor.updateMany({
            where: {
              id: { in: args.transactionAnchorIds },
              status: AnchorStatus.PENDING,
              batchId: null,
            },
            data: { batchId: args.batchId },
          })
        : { count: 0 };
      const vcRes = args.vcAnchorIds.length
        ? await tx.vcAnchor.updateMany({
            where: {
              id: { in: args.vcAnchorIds },
              status: AnchorStatus.PENDING,
              batchId: null,
            },
            data: { batchId: args.batchId },
          })
        : { count: 0 };
      const didRes = args.userDidAnchorIds.length
        ? await tx.userDidAnchor.updateMany({
            where: {
              id: { in: args.userDidAnchorIds },
              status: AnchorStatus.PENDING,
              batchId: null,
            },
            data: { batchId: args.batchId },
          })
        : { count: 0 };
      return {
        transactionAnchors: txRes.count,
        vcAnchors: vcRes.count,
        userDidAnchors: didRes.count,
      };
    });
  }

  async markSubmitted(
    ctx: IContext,
    args: {
      batchId: string;
      chainTxHash: string;
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
  ): Promise<void> {
    const submittedAt = new Date();
    await this.applyToAllAnchors(ctx, args, {
      txData: { status: AnchorStatus.SUBMITTED, chainTxHash: args.chainTxHash, submittedAt },
      vcData: { status: AnchorStatus.SUBMITTED, chainTxHash: args.chainTxHash, submittedAt },
      didData: { status: AnchorStatus.SUBMITTED, chainTxHash: args.chainTxHash, submittedAt },
    });
  }

  async markConfirmed(
    ctx: IContext,
    args: {
      batchId: string;
      blockHeight: number | null;
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
  ): Promise<void> {
    const confirmedAt = new Date();
    await this.applyToAllAnchors(ctx, args, {
      txData: { status: AnchorStatus.CONFIRMED, confirmedAt, blockHeight: args.blockHeight },
      vcData: { status: AnchorStatus.CONFIRMED, confirmedAt, blockHeight: args.blockHeight },
      // userDidAnchor has no blockHeight column.
      didData: { status: AnchorStatus.CONFIRMED, confirmedAt },
    });
  }

  async markFailed(
    ctx: IContext,
    args: {
      batchId: string;
      failureReason: string;
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
  ): Promise<void> {
    await this.applyToAllAnchors(ctx, args, {
      txData: { status: AnchorStatus.FAILED, lastError: args.failureReason },
      vcData: { status: AnchorStatus.FAILED, lastError: args.failureReason },
      // userDidAnchor has no lastError column.
      didData: { status: AnchorStatus.FAILED },
    });
  }

  /**
   * Fan a status update across all three anchor tables in one
   * `issuer.internal` transaction. Empty id lists short-circuit to
   * `Promise.resolve()` so we never issue a no-op `updateMany` (and the
   * per-table `data` shape stays explicit for the few schema columns
   * that diverge — e.g. `userDidAnchor` has no `blockHeight` / `lastError`).
   */
  private async applyToAllAnchors(
    ctx: IContext,
    args: {
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
    data: {
      txData: Prisma.TransactionAnchorUpdateManyMutationInput;
      vcData: Prisma.VcAnchorUpdateManyMutationInput;
      didData: Prisma.UserDidAnchorUpdateManyMutationInput;
    },
  ): Promise<void> {
    const issuer = ctx.issuer ?? this.getIssuer();
    await issuer.internal(async (tx) => {
      await Promise.all([
        args.transactionAnchorIds.length
          ? tx.transactionAnchor.updateMany({
              where: { id: { in: args.transactionAnchorIds } },
              data: data.txData,
            })
          : Promise.resolve(),
        args.vcAnchorIds.length
          ? tx.vcAnchor.updateMany({
              where: { id: { in: args.vcAnchorIds } },
              data: data.vcData,
            })
          : Promise.resolve(),
        args.userDidAnchorIds.length
          ? tx.userDidAnchor.updateMany({
              where: { id: { in: args.userDidAnchorIds } },
              data: data.didData,
            })
          : Promise.resolve(),
      ]);
    });
  }

  async findPendingVcAnchorsByBatchId(ctx: IContext, batchId: string): Promise<PendingVcAnchor[]> {
    const issuer = ctx.issuer ?? this.getIssuer();
    return issuer.internal((tx) =>
      tx.vcAnchor.findMany({
        where: { batchId },
        select: VC_ANCHOR_SELECT,
      }),
    );
  }

  async findPendingUserDidAnchorsByBatchId(
    ctx: IContext,
    batchId: string,
  ): Promise<PendingUserDidAnchor[]> {
    const issuer = ctx.issuer ?? this.getIssuer();
    return issuer.internal((tx) =>
      tx.userDidAnchor.findMany({
        where: { batchId },
        select: USER_DID_ANCHOR_SELECT,
      }),
    );
  }
}

const TX_ANCHOR_SELECT = {
  id: true,
  leafIds: true,
  leafCount: true,
  rootHash: true,
  network: true,
  status: true,
  batchId: true,
  chainTxHash: true,
  periodStart: true,
  periodEnd: true,
} as const;

const VC_ANCHOR_SELECT = {
  id: true,
  leafIds: true,
  leafCount: true,
  rootHash: true,
  network: true,
  status: true,
  batchId: true,
  periodStart: true,
  periodEnd: true,
} as const;

const USER_DID_ANCHOR_SELECT = {
  id: true,
  did: true,
  operation: true,
  documentHash: true,
  documentCbor: true,
  previousAnchorId: true,
  network: true,
  status: true,
  batchId: true,
  userId: true,
} as const;
