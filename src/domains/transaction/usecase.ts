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
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionService from "@/domains/transaction/service";
import TransactionOutputFormat from "@/domains/transaction/presenter/output";

export default class TransactionUseCase {
  static async visitorBrowseTransactions(
    { filter, sort, cursor, first }: GqlQueryTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    const take = first ?? 10;
    const res = await TransactionService.fetchTransactions(ctx, { filter, sort, cursor }, take);
    const hasNextPage = res.length > take;

    const data: GqlTransaction[] = res.slice(0, take).map((record) => {
      return TransactionOutputFormat.get(record);
    });
    return TransactionOutputFormat.query(data, hasNextPage);
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
