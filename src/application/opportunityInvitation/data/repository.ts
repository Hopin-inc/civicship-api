import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { opportunityInvitationInclude } from "@/application/opportunityInvitation/data/type";

export default class OpportunityInvitationRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.OpportunityInvitationWhereInput,
    orderBy: Prisma.OpportunityInvitationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunityInvitation.findMany({
        where,
        orderBy,
        include: opportunityInvitationInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunityInvitation.findUnique({
        where: { id },
        include: opportunityInvitationInclude,
      });
    });
  }

  static async create(data: Prisma.OpportunityInvitationCreateInput, tx: Prisma.TransactionClient) {
    return tx.opportunityInvitation.create({
      data,
      include: opportunityInvitationInclude,
    });
  }

  static async disable(id: string, isValid: boolean, tx: Prisma.TransactionClient) {
    return tx.opportunityInvitation.update({
      where: { id },
      data: {
        isValid,
      },
      include: opportunityInvitationInclude,
    });
  }
}
