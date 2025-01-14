import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/domains/opportunity/type";
// import { refreshMaterializedViewOpportunityStat } from "@prisma/client/sql";

export default class OpportunityRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.OpportunityWhereInput,
    orderBy: Prisma.OpportunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.db.opportunity.findMany({
      where,
      orderBy,
      include: opportunityInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async find(id: string) {
    return this.db.opportunity.findUnique({
      where: { id },
      include: opportunityInclude,
    });
  }

  static async create(data: Prisma.OpportunityCreateInput) {
    return this.db.opportunity.create({
      data,
      include: opportunityInclude,
    });
  }

  static async findWithTransaction(tx: Prisma.TransactionClient, id: string) {
    return tx.opportunity.findUnique({
      where: { id },
    });
  }

  // static async refreshStat() {
  //   return this.db.$queryRawTyped(refreshMaterializedViewOpportunityStat());
  // }
}
