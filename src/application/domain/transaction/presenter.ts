import {
  GqlTransaction,
  GqlTransactionsConnection,
  GqlTransactionIssueCommunityPointSuccess,
  GqlTransactionGrantCommunityPointSuccess,
  GqlTransactionDonateSelfPointSuccess,
  GqlTransactionChain,
  GqlTransactionReason,
  GqlTransactionUpdateMetadataSuccess,
} from "@/types/graphql";
import { PrismaTransactionDetail, TransactionChainRow } from "@/application/domain/transaction/data/type";

export default class TransactionPresenter {
  static query(r: GqlTransaction[], hasNextPage: boolean, cursor?: string): GqlTransactionsConnection {
    return {
      __typename: "TransactionsConnection",
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: r[0]?.id,
        endCursor: r.length ? r[r.length - 1].id : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaTransactionDetail): GqlTransaction {
    return {
      __typename: "Transaction",
      ...r,
    };
  }

  static issueCommunityPoint(r: PrismaTransactionDetail): GqlTransactionIssueCommunityPointSuccess {
    return {
      __typename: "TransactionIssueCommunityPointSuccess",
      transaction: this.get(r),
    };
  }

  static grantCommunityPoint(r: PrismaTransactionDetail): GqlTransactionGrantCommunityPointSuccess {
    return {
      __typename: "TransactionGrantCommunityPointSuccess",
      transaction: this.get(r),
    };
  }

  static giveUserPoint(r: PrismaTransactionDetail): GqlTransactionDonateSelfPointSuccess {
    return {
      __typename: "TransactionDonateSelfPointSuccess",
      transaction: this.get(r),
    };
  }

  static updateMetadata(r: PrismaTransactionDetail): GqlTransactionUpdateMetadataSuccess {
    return {
      __typename: "TransactionUpdateMetadataSuccess",
      transaction: this.get(r),
    };
  }

  static chain(rows: TransactionChainRow[]): GqlTransactionChain {
    return {
      __typename: "TransactionChain",
      depth: rows.length,
      steps: rows.map((row) => ({
        __typename: "TransactionChainStep",
        id: row.id,
        reason: row.reason as GqlTransactionReason,
        points: row.points,
        createdAt: row.created_at,
        fromUser: row.from_user_id
          ? {
              __typename: "TransactionChainUser",
              id: row.from_user_id,
              name: row.from_user_name ?? "",
              image: row.from_user_image ?? null,
            }
          : null,
        toUser: row.to_user_id
          ? {
              __typename: "TransactionChainUser",
              id: row.to_user_id,
              name: row.to_user_name ?? "",
              image: row.to_user_image ?? null,
            }
          : null,
      })),
    };
  }
}
