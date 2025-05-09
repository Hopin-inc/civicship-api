import {
  GqlUtility,
  GqlUtilitiesConnection,
  GqlUtilityCreateSuccess,
  GqlUtilityDeleteSuccess,
  GqlUtilityUpdateInfoSuccess,
} from "@/types/graphql";
import { PrismaUtilityDetail } from "@/application/domain/reward/utility/data/type";

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

  static get(r: PrismaUtilityDetail): GqlUtility {
    return r;
  }

  static create(r: PrismaUtilityDetail): GqlUtilityCreateSuccess {
    return {
      utility: this.get(r),
    };
  }

  static delete(r: PrismaUtilityDetail): GqlUtilityDeleteSuccess {
    return {
      utilityId: r.id,
    };
  }

  static updateInfo(r: PrismaUtilityDetail): GqlUtilityUpdateInfoSuccess {
    return {
      utility: this.get(r),
    };
  }
}
