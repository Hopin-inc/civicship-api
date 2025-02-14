import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionDonateSelfPointArgs,
  GqlTransactionsConnection,
  GqlTransaction,
  GqlTransactionIssueCommunityPointPayload,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionDonateSelfPointPayload,
  GqlParticipation,
  GqlParticipationTransactionsArgs,
  GqlWallet,
  GqlWalletTransactionsArgs,
  GqlUtility,
  GqlUtilityTransactionsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionService from "@/domains/transaction/service";
import TransactionOutputFormat from "@/domains/transaction/presenter/output";
import TransactionUtils from "@/domains/transaction/utils";

export default class TransactionUseCase {
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

  static async ownerIssueCommunityPoint(
    { input }: GqlMutationTransactionIssueCommunityPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionIssueCommunityPointPayload> {
    const res = await TransactionService.issueCommunityPoint(ctx, input);
    return TransactionOutputFormat.issueCommunityPoint(res);
  }

  static async managerGrantCommunityPoint(
    { input }: GqlMutationTransactionGrantCommunityPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionGrantCommunityPointPayload> {
    const res = await TransactionService.grantCommunityPoint(ctx, input);
    return TransactionOutputFormat.grantCommunityPoint(res);
  }

  static async userDonateSelfPointToAnother(
    { input }: GqlMutationTransactionDonateSelfPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionDonateSelfPointPayload> {
    const res = await TransactionService.donateSelfPoint(ctx, input);
    return TransactionOutputFormat.giveUserPoint(res);
  }
}
