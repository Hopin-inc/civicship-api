import {
  GqlUtility,
  GqlUtilitiesConnection,
  GqlUtilityCreateSuccess,
  GqlUtilityDeleteSuccess,
  GqlUtilityUpdateInfoSuccess,
  GqlUtilityRedeemSuccess,
} from "@/types/graphql";
import { UtilityGetPayloadWithArgs } from "@/infra/prisma/types/utility";
import { TransactionPayloadWithArgs } from "@/infra/prisma/types/transaction";
import { Utility } from "@prisma/client";
import TransactionOutputFormat from "@/presentation/graphql/dto/transaction/output";

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

  static redeemUtility(r: TransactionPayloadWithArgs): GqlUtilityRedeemSuccess {
    return {
      __typename: "UtilityRedeemSuccess",
      transaction: TransactionOutputFormat.get(r),
    };
  }
}
