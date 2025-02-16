import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlTransactionsConnection,
  GqlTransaction,
  GqlParticipation,
  GqlParticipationTransactionsArgs,
  GqlWallet,
  GqlWalletTransactionsArgs,
  GqlUtility,
  GqlUtilityTransactionsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionService from "@/app/transaction/service";
import TransactionOutputFormat from "@/presen/graphql/dto/transaction/output";
import TransactionUtils from "@/app/transaction/utils";

export default class TransactionReadUseCase {
  static async visitorBrowseTransactions(
    { filter, sort, cursor, first }: GqlQueryTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    return TransactionUtils.fetchTransactionsCommon(ctx, {
      filter,
      sort,
      cursor,
      first,
    });
  }

  static async visitorBrowseTransactionsByParticipation(
    { id }: GqlParticipation,
    { first, cursor }: GqlParticipationTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    return TransactionUtils.fetchTransactionsCommon(ctx, {
      filter: { participationId: id },
      cursor,
      first,
    });
  }

  static async visitorBrowseTransactionsByWallet(
    { id }: GqlWallet,
    { first, cursor }: GqlWalletTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    return TransactionUtils.fetchTransactionsCommon(ctx, {
      filter: { fromWalletId: id, toWalletId: id },
      cursor,
      first,
    });
  }

  static async visitorBrowseTransactionsByUtility(
    { id }: GqlUtility,
    { first, cursor }: GqlUtilityTransactionsArgs,
    ctx: IContext,
  ) {
    return TransactionUtils.fetchTransactionsCommon(ctx, {
      cursor,
      filter: { utilityId: id },
      first,
    });
  }

  static async visitorViewTransaction(
    { id }: GqlQueryTransactionArgs,
    ctx: IContext,
  ): Promise<GqlTransaction | null> {
    const res = await TransactionService.findTransaction(ctx, id);
    if (!res) {
      return null;
    }
    return TransactionOutputFormat.get(res);
  }
}
