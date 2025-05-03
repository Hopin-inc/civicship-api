import {
  GqlUtility,
  GqlUtilitiesConnection,
  GqlUtilityCreateSuccess,
  GqlUtilityDeleteSuccess,
  GqlUtilityUpdateInfoSuccess,
} from "@/types/graphql";
import { PrismaUtility, PrismaUtilityDetail } from "@/application/domain/reward/utility/data/type";

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

  static get(r: PrismaUtility | PrismaUtilityDetail): GqlUtility {
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      pointsRequired: r.pointsRequired,
      publishStatus: r.publishStatus,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      community: {
        id: r.community?.id || r.communityId || "",
        name: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: null,
        image: null,
        places: null,
        memberships: null,
        opportunities: null,
        participations: null,
        articles: null,
        utilities: null,
        wallets: null,
        establishedAt: null,
        pointName: null,
        website: null
      },
      images: null,
      requiredForOpportunities: null,
      ticketIssuers: null,
      tickets: null,
    };
  }

  static create(r: PrismaUtility): GqlUtilityCreateSuccess {
    return {
      __typename: "UtilityCreateSuccess",
      utility: this.get(r),
    };
  }

  static delete(r: PrismaUtilityDetail | { id: string }): GqlUtilityDeleteSuccess {
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
