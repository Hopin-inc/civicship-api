import {
  GqlUtility,
  GqlUtilitiesConnection,
  GqlUtilityCreateSuccess,
  GqlUtilityDeleteSuccess,
  GqlUtilityUpdateInfoSuccess,
  GqlUtilityPurchaseSuccess,
  GqlUtilityRefundSuccess,
} from "@/types/graphql";
import { UtilityGetPayloadWithArgs } from "@/application/utility/infrastructure/type";
import { TransactionPayloadWithArgs } from "@/application/transaction/infrastructure/type";
import { Utility } from "@prisma/client";
import TransactionOutputFormat from "@/application/transaction/presenter";

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
    return r;
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

  static purchaseUtility(r: TransactionPayloadWithArgs): GqlUtilityPurchaseSuccess {
    return {
      __typename: "UtilityPurchaseSuccess",
      transaction: TransactionOutputFormat.get(r),
    };
  }

  static refundUtility(r: TransactionPayloadWithArgs): GqlUtilityRefundSuccess {
    return {
      __typename: "UtilityRefundSuccess",
      transaction: TransactionOutputFormat.get(r),
    };
  }
}
