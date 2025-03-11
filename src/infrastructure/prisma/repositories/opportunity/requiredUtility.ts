import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { opportunityRequiredUtilityInclude } from "@/infrastructure/prisma/types/opportunity/requiredUtility";
import { Prisma } from "@prisma/client";

export default class OpportunityRequiredUtilityRepository {
  private static issuer = new PrismaClientIssuer();

  static async queryByOpportunityId(ctx: IContext, opportunityId: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunityRequiredUtility.findMany({
        where: { opportunityId },
        include: opportunityRequiredUtilityInclude,
      });
    });
  }

  static async find(
    ctx: IContext,
    where: Prisma.OpportunityRequiredUtilityWhereUniqueInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.opportunityRequiredUtility.findUnique({
        where,
        include: opportunityRequiredUtilityInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.opportunityRequiredUtility.findUnique({
          where,
          include: opportunityRequiredUtilityInclude,
        });
      });
    }
  }
}
