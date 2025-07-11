import {
  GqlParticipationsConnection,
  GqlParticipation,
  GqlParticipationCreatePersonalRecordSuccess,
  GqlParticipationDeleteSuccess,
  GqlParticipationBulkCreateSuccess,
} from "@/types/graphql";
import { PrismaParticipationDetail } from "@/application/domain/experience/participation/data/type";

export default class ParticipationPresenter {
  static query(r: GqlParticipation[], hasNextPage: boolean): GqlParticipationsConnection {
    return {
      __typename: "ParticipationsConnection",
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

  static get(r: PrismaParticipationDetail): GqlParticipation {
    return {
      __typename: "Participation",
      ...r,
    };
  }

  static create(r: PrismaParticipationDetail): GqlParticipationCreatePersonalRecordSuccess {
    return {
      __typename: "ParticipationCreatePersonalRecordSuccess",
      participation: this.get(r),
    };
  }

  static delete(r: PrismaParticipationDetail): GqlParticipationDeleteSuccess {
    return {
      __typename: "ParticipationDeleteSuccess",
      participationId: r.id,
    };
  }

  static bulkCreate(
    participations: PrismaParticipationDetail[],
  ): GqlParticipationBulkCreateSuccess {
    return {
      __typename: "ParticipationBulkCreateSuccess",
      participations: participations.map(this.get),
    };
  }
}
