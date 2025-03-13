import {
  GqlParticipationsConnection,
  GqlParticipation,
  GqlParticipationApplySuccess,
  GqlParticipationSetStatusPayload,
  GqlParticipationInviteSuccess,
} from "@/types/graphql";
import { PrismaParticipation } from "@/application/participation/data/type";
import OpportunityPresenter from "@/application/opportunity/presenter";

export default class ParticipationPresenter {
  static query(r: GqlParticipation[], hasNextPage: boolean): GqlParticipationsConnection {
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

  static get(r: PrismaParticipation): GqlParticipation {
    const { user, opportunity, community } = r;

    return {
      ...r,
      user,
      community,
      opportunity: opportunity ? OpportunityPresenter.get(opportunity) : null,
    };
  }

  static invite(r: PrismaParticipation): GqlParticipationInviteSuccess {
    return {
      __typename: "ParticipationInviteSuccess",
      participation: this.get(r),
    };
  }

  static apply(r: PrismaParticipation): GqlParticipationApplySuccess {
    return {
      __typename: "ParticipationApplySuccess",
      participation: this.get(r),
    };
  }

  static setStatus(r: PrismaParticipation): GqlParticipationSetStatusPayload {
    return {
      __typename: "ParticipationSetStatusSuccess",
      participation: this.get(r),
    };
  }
}
