import { IContext } from "@/types/server";
import {
  GqlTransaction,
  GqlTransactionsConnection,
  GqlTransactionFilterInput,
  GqlTransactionSortInput,
} from "@/types/graphql";
import TransactionService from "@/application/transaction/service";
import TransactionPresenter from "@/application/transaction/presenter";
import { clampFirst } from "@/utils";

export default class TransactionUtils {
  static async fetchTransactionsCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlTransactionFilterInput;
      sort?: GqlTransactionSortInput;
      first?: number;
    },
  ): Promise<GqlTransactionsConnection> {
    const take = clampFirst(first);

    const res = await TransactionService.fetchTransactions(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data: GqlTransaction[] = res.slice(0, take).map((record) => {
      return TransactionPresenter.get(record);
    });

    return TransactionPresenter.query(data, hasNextPage);
  }
}
