import {
  GqlUtility,
  GqlUtilitiesConnection,
  GqlUtilityCreateSuccess,
  GqlUtilityDeleteSuccess,
  GqlUtilityUpdateInfoSuccess,
} from "@/types/graphql";
import { PrismaUtility } from "@/application/domain/utility/data/type";
import { Utility } from "@prisma/client";

export default class UtilityPresenter {
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

  static get(r: PrismaUtility): GqlUtility {
    return r;
  }

  static create(r: PrismaUtility): GqlUtilityCreateSuccess {
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

  static updateInfo(r: PrismaUtility): GqlUtilityUpdateInfoSuccess {
    return {
      __typename: "UtilityUpdateInfoSuccess",
      utility: this.get(r),
    };
  }
}
