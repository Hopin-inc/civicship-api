import {
  GqlUtility,
  GqlUtilitiesConnection,
  GqlUtilityCreateSuccess,
  GqlUtilityDeleteSuccess,
  GqlUtilityUpdateInfoSuccess,
  GqlUtilityUseSuccess,
} from "@/types/graphql";
import { UtilityGetPayloadWithArgs } from "@/domains/utility/type";
import { TransactionPayloadWithArgs } from "@/domains/transaction/type";
import { Utility } from "@prisma/client";
import TransactionOutputFormat from "@/domains/transaction/presenter/output";

export default class UtilityResponseFormat {
  static query(utilities: GqlUtility[], hasNextPage: boolean): GqlUtilitiesConnection {
    return {
      totalCount: utilities.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: utilities[0]?.id,
        endCursor: utilities.length ? utilities[utilities.length - 1].id : undefined,
      },
      edges: utilities.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: UtilityGetPayloadWithArgs): GqlUtility {
    const { community, transactions, ...prop } = r;

    return {
      ...prop,
      community,
      transactions: transactions?.map((transaction: TransactionPayloadWithArgs) => ({
        ...transaction,
        fromWallet: transaction.fromWallet
          ? {
              ...transaction.fromWallet,
              community: {
                ...transaction.fromWallet.community,
                city: transaction.fromWallet.community.city,
              },
            }
          : null,
        toWallet: transaction.toWallet
          ? {
              ...transaction.toWallet,
              community: {
                ...transaction.toWallet.community,
                city: transaction.toWallet.community.city,
              },
            }
          : null,
      })),
    };
  }

  static create(r: UtilityGetPayloadWithArgs): GqlUtilityCreateSuccess {
    return {
      __typename: "UtilityCreateSuccess",
      utility: this.get(r),
    };
  }

  static delete(r: Utility): GqlUtilityDeleteSuccess {
    return {
      __typename: "UtilityDeleteSuccess",
      utilityId: r.id,
    };
  }

  static updateInfo(r: UtilityGetPayloadWithArgs): GqlUtilityUpdateInfoSuccess {
    return {
      __typename: "UtilityUpdateInfoSuccess",
      utility: this.get(r),
    };
  }

  static useUtility(r: TransactionPayloadWithArgs): GqlUtilityUseSuccess {
    return {
      __typename: "UtilityUseSuccess",
      transaction: TransactionOutputFormat.get(r),
    };
  }
}
