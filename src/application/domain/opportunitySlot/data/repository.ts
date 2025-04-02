import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { OpportunitySlotHostingStatus, Prisma } from "@prisma/client";
import {
  refreshMaterializedViewRemainingCapacity,
  refreshMaterializedViewEarliestReservableSlot,
} from "@prisma/client/sql";
import { IContext } from "@/types/server";
import {
  opportunitySlotInclude,
  opportunitySlotWithParticipationInclude,
} from "@/application/domain/opportunitySlot/data/type";

export default class OpportunitySlotRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.OpportunitySlotWhereInput,
    orderBy: Prisma.OpportunitySlotOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findMany({
        where,
        orderBy,
        include: opportunitySlotInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findUnique({
        where: { id },
        include: opportunitySlotInclude,
      });
    });
  }

  static async findByOpportunityId(
    ctx: IContext,
    opportunityId: string,
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunitySlot.findMany({
      where: { opportunityId },
      include: opportunitySlotInclude,
    });
  }

  static async createMany(
    ctx: IContext,
    data: Prisma.OpportunitySlotCreateManyInput[],
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunitySlot.createMany({ data });
  }

  static async update(
    ctx: IContext,
    id: string,
    data: Prisma.OpportunitySlotUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.opportunitySlot.update({
        where: { id },
        data,
        include: opportunitySlotInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.opportunitySlot.update({
          where: { id },
          data,
          include: opportunitySlotInclude,
        });
      });
    }
  }

  static async setHostingStatus(
    ctx: IContext,
    id: string,
    hostingStatus: OpportunitySlotHostingStatus,
    tx: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.opportunitySlot.update({
        where: { id },
        data: { hostingStatus },
        include: opportunitySlotWithParticipationInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.opportunitySlot.update({
          where: { id },
          data: { hostingStatus },
          include: opportunitySlotWithParticipationInclude,
        });
      });
    }
  }

  static async deleteMany(ctx: IContext, ids: string[], tx: Prisma.TransactionClient) {
    return tx.opportunitySlot.deleteMany({
      where: { id: { in: ids } },
    });
  }

  static async refreshRemainingCapacity(ctx: IContext, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.$queryRawTyped(refreshMaterializedViewRemainingCapacity());
    }
    return this.issuer.public(ctx, async (dbTx) => {
      return dbTx.$queryRawTyped(refreshMaterializedViewRemainingCapacity());
    });
  }

  static async refreshEarliestReservableSlot(ctx: IContext, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.$queryRawTyped(refreshMaterializedViewEarliestReservableSlot());
    }
    return this.issuer.public(ctx, async (dbTx) => {
      return dbTx.$queryRawTyped(refreshMaterializedViewEarliestReservableSlot());
    });
  }
}
