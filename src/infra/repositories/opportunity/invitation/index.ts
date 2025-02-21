import { PrismaClientIssuer } from "@/infra/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { opportunityInvitationInclude } from "@/infra/prisma/types/opportunity/invitation";

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

  static async create(
    ctx: IContext,
    data: Prisma.OpportunityInvitationCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunityInvitation.create({
      data,
      include: opportunityInvitationInclude,
    });
  }

  static async disable(ctx: IContext, id: string, isValid: boolean, tx: Prisma.TransactionClient) {
    return tx.opportunityInvitation.update({
      where: { id },
      data: {
        isValid,
      },
      include: opportunityInvitationInclude,
    });
  }

  static async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.opportunityInvitation.delete({
      where: { id },
      include: opportunityInvitationInclude,
    });
  }
}
