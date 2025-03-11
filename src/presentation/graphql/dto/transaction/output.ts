import {
  GqlTransaction,
  GqlTransactionsConnection,
  GqlTransactionIssueCommunityPointSuccess,
  GqlTransactionGrantCommunityPointSuccess,
  GqlTransactionDonateSelfPointSuccess,
} from "@/types/graphql";
import { TransactionPayloadWithArgs } from "@/infrastructure/prisma/types/transaction";

export default class TransactionOutputFormat {
  static query(r: GqlTransaction[], hasNextPage: boolean): GqlTransactionsConnection {
    return {
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: r[0]?.id,
        endCursor: r.length ? r[r.length - 1].id : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: TransactionPayloadWithArgs): GqlTransaction {
    const { fromWallet, toWallet, participation, ...prop } = r;

    return {
      ...prop,
      fromWallet,
      toWallet,
      participation,
    };
  }

  static issueCommunityPoint(
    r: TransactionPayloadWithArgs,
  ): GqlTransactionIssueCommunityPointSuccess {
    return {
      __typename: "TransactionIssueCommunityPointSuccess",
      transaction: this.get(r),
    };
  }

  static grantCommunityPoint(
    r: TransactionPayloadWithArgs,
  ): GqlTransactionGrantCommunityPointSuccess {
    return {
      __typename: "TransactionGrantCommunityPointSuccess",
      transaction: this.get(r),
    };
  }

  static giveUserPoint(r: TransactionPayloadWithArgs): GqlTransactionDonateSelfPointSuccess {
    return {
      __typename: "TransactionDonateSelfPointSuccess",
      transaction: this.get(r),
    };
  }
}
