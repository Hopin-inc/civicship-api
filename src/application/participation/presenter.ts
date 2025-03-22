import {
  GqlParticipationsConnection,
  GqlParticipation,
  GqlParticipationCreatePersonalRecordSuccess,
  GqlParticipationDeleteSuccess,
} from "@/types/graphql";
import { PrismaParticipation } from "@/application/participation/data/type";

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
    const { user, community } = r;

    return {
      ...r,
      user,
      community,
    };
  }

  static create(r: PrismaParticipation): GqlParticipationCreatePersonalRecordSuccess {
    return {
      __typename: "ParticipationCreatePersonalRecordSuccess",
      participation: this.get(r),
    };
  }

  static delete(r: PrismaParticipation): GqlParticipationDeleteSuccess {
    return {
      __typename: "ParticipationDeleteSuccess",
      participationId: r.id,
    };
  }
}
