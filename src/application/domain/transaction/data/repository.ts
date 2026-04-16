import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { ITransactionRepository } from "@/application/domain/transaction/data/interface";
import {
  transactionSelectDetail,
  PrismaTransactionDetail,
  TransactionChainRow,
} from "@/application/domain/transaction/data/type";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
import { injectable } from "tsyringe";

@injectable()
export default class TransactionRepository implements ITransactionRepository {
  async query(
    ctx: IContext,
    where: Prisma.TransactionWhereInput,
    orderBy: Prisma.TransactionOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaTransactionDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.transaction.findMany({
        where,
        orderBy,
        select: transactionSelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaTransactionDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.transaction.findUnique({
        where: { id },
        select: transactionSelectDetail,
      });
    });
  }

  async findLatestReceivedTx(
    _ctx: IContext,
    walletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string; chainDepth: number | null } | null> {
    return tx.transaction.findFirst({
      where: {
        to: walletId,
        reason: { in: ["GRANT", "ONBOARDING", "POINT_REWARD", "DONATION"] },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, chainDepth: true },
    });
  }

  async findChain(ctx: IContext, txId: string): Promise<TransactionChainRow[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.$queryRaw<TransactionChainRow[]>`
        WITH RECURSIVE chain AS (
          SELECT id, parent_tx_id, reason, "from", "to", to_point_change, created_at, 1 AS seq
          FROM t_transactions
          WHERE id = ${txId}

          UNION ALL

          SELECT t.id, t.parent_tx_id, t.reason, t."from", t."to", t.to_point_change, t.created_at, c.seq + 1
          FROM t_transactions t
          INNER JOIN chain c ON t.id = c.parent_tx_id
          WHERE c.seq < 10
        )
        SELECT
          c.id,
          c.reason,
          c.to_point_change AS points,
          c.created_at,
          fu.id   AS from_user_id,
          fu.name AS from_user_name,
          fui.url AS from_user_image,
          fu.bio  AS from_user_bio,
          fc.id   AS from_community_id,
          fc.name AS from_community_name,
          fpc.square_logo_path AS from_community_image,
          fc.bio  AS from_community_bio,
          tu.id   AS to_user_id,
          tu.name AS to_user_name,
          tui.url AS to_user_image,
          tu.bio  AS to_user_bio,
          tc.id   AS to_community_id,
          tc.name AS to_community_name,
          tpc.square_logo_path AS to_community_image,
          tc.bio  AS to_community_bio
        FROM chain c
        LEFT JOIN t_wallets                fw  ON fw.id = c."from"
        LEFT JOIN t_users                  fu  ON fu.id = fw.user_id
        LEFT JOIN t_images                 fui ON fui.id = fu.image_id
        LEFT JOIN t_communities            fc  ON fc.id = fw.community_id AND fw.type = 'COMMUNITY'
        LEFT JOIN t_community_configs      fcc ON fcc.community_id = fc.id
        LEFT JOIN t_community_portal_configs fpc ON fpc.config_id = fcc.id
        LEFT JOIN t_wallets                tw  ON tw.id = c."to"
        LEFT JOIN t_users                  tu  ON tu.id = tw.user_id
        LEFT JOIN t_images                 tui ON tui.id = tu.image_id
        LEFT JOIN t_communities            tc  ON tc.id = tw.community_id AND tw.type = 'COMMUNITY'
        LEFT JOIN t_community_configs      tcc ON tcc.community_id = tc.id
        LEFT JOIN t_community_portal_configs tpc ON tpc.config_id = tcc.id
        ORDER BY c.seq DESC
      `;
    });
  }

  async refreshCurrentPoints(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<refreshMaterializedViewCurrentPoints.Result[]> {
    return tx.$queryRawTyped(refreshMaterializedViewCurrentPoints());
  }

  async create(
    ctx: IContext,
    data: Prisma.TransactionCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail> {
    return tx.transaction.create({
      data,
      select: transactionSelectDetail,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.TransactionUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail> {
    return tx.transaction.update({
      where: { id },
      data,
      select: transactionSelectDetail,
    });
  }
}
