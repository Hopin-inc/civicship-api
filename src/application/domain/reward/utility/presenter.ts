import {
  GqlUtility,
  GqlUtilitiesConnection,
  GqlUtilityCreateSuccess,
  GqlUtilityDeleteSuccess,
  GqlUtilityUpdateInfoSuccess,
} from "@/types/graphql";
import { PrismaUtilityDetail } from "@/application/domain/reward/utility/data/type";

export default class UtilityPresenter {
  static query(utilities: GqlUtility[], hasNextPage: boolean, cursor?: string): GqlUtilitiesConnection {
    return {
      __typename: "UtilitiesConnection",
      totalCount: utilities.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: utilities[0]?.id,
        endCursor: utilities.length ? utilities[utilities.length - 1].id : undefined,
      },
      edges: utilities.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaUtilityDetail): GqlUtility {
    return {
      __typename: "Utility",
      ...r,
    };
  }

  static create(r: PrismaUtilityDetail): GqlUtilityCreateSuccess {
    return {
      __typename: "UtilityCreateSuccess",
      utility: this.get(r),
    };
  }

  static delete(r: PrismaUtilityDetail): GqlUtilityDeleteSuccess {
    return {
      __typename: "UtilityDeleteSuccess",
      utilityId: r.id,
    };
  }

  static updateInfo(r: PrismaUtilityDetail): GqlUtilityUpdateInfoSuccess {
    return {
      __typename: "UtilityUpdateInfoSuccess",
      utility: this.get(r),
    };
  }
}
