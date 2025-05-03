import {
  GqlTransaction,
  GqlTransactionsConnection,
  GqlTransactionIssueCommunityPointSuccess,
  GqlTransactionGrantCommunityPointSuccess,
  GqlTransactionDonateSelfPointSuccess,
} from "@/types/graphql";
import { PrismaTransaction, PrismaTransactionDetail } from "@/application/domain/transaction/data/type";

export default class TransactionPresenter {
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

  static get(r: PrismaTransaction | PrismaTransactionDetail): GqlTransaction {
    return {
      ...r,
      fromWallet: null,
      toWallet: null,
      participation: null,
    };
  }

  static issueCommunityPoint(r: PrismaTransaction | PrismaTransactionDetail): GqlTransactionIssueCommunityPointSuccess {
    return {
      __typename: "TransactionIssueCommunityPointSuccess",
      transaction: this.get(r),
    };
  }

  static grantCommunityPoint(r: PrismaTransaction | PrismaTransactionDetail): GqlTransactionGrantCommunityPointSuccess {
    return {
      __typename: "TransactionGrantCommunityPointSuccess",
      transaction: this.get(r),
    };
  }

  static giveUserPoint(r: PrismaTransaction | PrismaTransactionDetail): GqlTransactionDonateSelfPointSuccess {
    return {
      __typename: "TransactionDonateSelfPointSuccess",
      transaction: this.get(r),
    };
  }
}
