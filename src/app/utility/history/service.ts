import { IContext } from "@/types/server";
import { GqlQueryUtilityHistoriesArgs } from "@/types/graphql";
import { Prisma, UtilityStatus } from "@prisma/client";
import UtilityHistoryRepository from "@/infra/prisma/repositories/utility/history";
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

  static async findUnusedUtilitiesOrThrow(ctx: IContext, walletId: string, utilityId: string) {
    const history = await UtilityHistoryRepository.queryAvailableUtilities(
      ctx,
      walletId,
      utilityId,
    );

    if (!history) {
      throw new Error("No such UtilityHistory found.");
    }
    if (history.length > 0) {
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
    status: UtilityStatus,
    walletId: string,
    utilityId: string,
    transactionId: string,
  ) {
    const data = UtilityHistoryInputFormat.create({
      status,
      walletId,
      utilityId,
      transactionId,
    });

    await UtilityHistoryRepository.create(ctx, data, tx);
  }
}
