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

  static async findUnusedOrThrow(ctx: IContext, historyId: string) {
    const history = await UtilityHistoryRepository.find(ctx, historyId);

    if (!history) {
      throw new Error("No such UtilityHistory found.");
    }
    if (history.usedAt) {
      throw new Error("Utility is already used.");
    }

    return history;
  }

  static async markAsUsed(ctx: IContext, utilityHistoryId: string, usedAt: Date) {
    return await UtilityHistoryRepository.insertUsedAt(ctx, utilityHistoryId, usedAt);
  }

  static async recordUtilityHistory(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    walletId: string,
    utilityId: string,
    transactionId: string,
  ) {
    const data = UtilityHistoryInputFormat.create({
      walletId,
      utilityId,
      transactionId,
    });

    await UtilityHistoryRepository.create(ctx, data, tx);
  }
}
