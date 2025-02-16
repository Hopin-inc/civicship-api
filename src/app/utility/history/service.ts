import { IContext } from "@/types/server";
import { GqlQueryUtilityHistoriesArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import UtilityHistoryRepository from "@/infra/repositories/utility/history";
import UtilityHistoryInputFormat from "@/presentation/graphql/dto/utility/history/input";

export default class UtilityHistoryService {
  static async fetchUtilityHistories(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUtilityHistoriesArgs,
    take: number,
  ) {
    const where = UtilityHistoryInputFormat.filter(filter);
    const orderBy = UtilityHistoryInputFormat.sort(sort);

    return await UtilityHistoryRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findUtilityHistory(ctx: IContext, id: string) {
    return await UtilityHistoryRepository.find(ctx, id);
  }

  static async recordUtilityHistory(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    walletId: string,
    utilityId: string,
    transactionId: string,
    usedAt?: Date,
  ) {
    const data = UtilityHistoryInputFormat.create({
      walletId,
      utilityId,
      transactionId,
      usedAt,
    });

    await UtilityHistoryRepository.create(ctx, data, tx);
  }
}
