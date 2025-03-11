import {
  GqlQueryUtilityHistoriesArgs,
  GqlQueryUtilityHistoryArgs,
  GqlUtilityHistoriesConnection,
  GqlUtilityHistory,
  GqlWallet,
  GqlUtility,
  GqlTransaction,
  GqlTransactionUtilityHistoriesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import UtilityHistoryUtils from "@/application/utilityHistory/utils";
import UtilityHistoryService from "@/application/utilityHistory/service";
import UtilityHistoryOutputFormat from "@/application/utilityHistory/presenter";

export default class UtilityHistoryUseCase {
  static async visitorBrowseUtilityHistories(
    { cursor, filter, sort, first }: GqlQueryUtilityHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlUtilityHistoriesConnection> {
    return UtilityHistoryUtils.fetchUtilityHistoriesCommon(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async visitorBrowseUtilityHistoriesByWallet(
    { id }: GqlWallet,
    { first, cursor }: GqlQueryUtilityHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlUtilityHistoriesConnection> {
    return UtilityHistoryUtils.fetchUtilityHistoriesCommon(ctx, {
      cursor,
      filter: { walletId: id },
      first,
    });
  }

  static async visitorBrowseUtilityHistoriesByTransaction(
    { id }: GqlTransaction,
    { first, cursor }: GqlTransactionUtilityHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlUtilityHistoriesConnection> {
    return UtilityHistoryUtils.fetchUtilityHistoriesCommon(ctx, {
      cursor,
      filter: { transactionId: id },
      first,
    });
  }

  static async visitorBrowseUtilityHistoriesByUtility(
    { id }: GqlUtility,
    { first, cursor }: GqlQueryUtilityHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlUtilityHistoriesConnection> {
    return UtilityHistoryUtils.fetchUtilityHistoriesCommon(ctx, {
      cursor,
      filter: { utilityId: id },
      first,
    });
  }

  static async visitorViewUtilityHistory(
    { id }: GqlQueryUtilityHistoryArgs,
    ctx: IContext,
  ): Promise<GqlUtilityHistory | null> {
    const res = await UtilityHistoryService.findUtilityHistory(ctx, id);
    if (!res) {
      return null;
    }
    return UtilityHistoryOutputFormat.get(res);
  }
}
