import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";

export default class ParticipationImageRepository {
  static async createMany(
    ctx: IContext,
    data: Prisma.ParticipationImageCreateManyInput[],
    tx: Prisma.TransactionClient,
  ) {
    return tx.participationImage.createMany({ data });
  }

  static async deleteMany(ctx: IContext, ids: string[], tx: Prisma.TransactionClient) {
    return tx.participationImage.deleteMany({ where: { id: { in: ids } } });
  }
}
