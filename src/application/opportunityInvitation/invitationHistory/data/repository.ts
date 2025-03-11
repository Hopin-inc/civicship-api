import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { invitationHistoryInclude } from "@/application/opportunityInvitation/invitationHistory/data/type";

export default class OpportunityInvitationHistoryRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.OpportunityInvitationHistoryWhereInput,
    orderBy: Prisma.OpportunityInvitationHistoryOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) =>
      tx.opportunityInvitationHistory.findMany({
        where,
        orderBy,
        include: invitationHistoryInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      }),
    );
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) =>
      tx.opportunityInvitationHistory.findUnique({
        where: { id },
        include: invitationHistoryInclude,
      }),
    );
  }
}
