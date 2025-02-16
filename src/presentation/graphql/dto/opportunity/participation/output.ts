import {
  GqlParticipationsConnection,
  GqlParticipation,
  GqlParticipationApplySuccess,
  GqlParticipationSetStatusPayload,
  GqlParticipationInviteSuccess,
} from "@/types/graphql";
import { ParticipationPayloadWithArgs } from "@/infrastructure/prisma/types/opportunity/participation";
import OpportunityOutputFormat from "@/presentation/graphql/dto/opportunity/output";

export default class ParticipationOutputFormat {
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

  static get(r: ParticipationPayloadWithArgs): GqlParticipation {
    const { user, opportunity, community } = r;

    return {
      ...r,
      user,
      community,
      opportunity: opportunity ? OpportunityOutputFormat.get(opportunity) : null,
    };
  }

  static invite(r: ParticipationPayloadWithArgs): GqlParticipationInviteSuccess {
    return {
      __typename: "ParticipationInviteSuccess",
      participation: this.get(r),
    };
  }

  static apply(r: ParticipationPayloadWithArgs): GqlParticipationApplySuccess {
    return {
      __typename: "ParticipationApplySuccess",
      participation: this.get(r),
    };
  }

  static setStatus(r: ParticipationPayloadWithArgs): GqlParticipationSetStatusPayload {
    return {
      __typename: "ParticipationSetStatusSuccess",
      participation: this.get(r),
    };
  }
}
