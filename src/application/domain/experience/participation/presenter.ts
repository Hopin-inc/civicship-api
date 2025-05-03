import {
  GqlParticipationsConnection,
  GqlParticipation,
  GqlParticipationCreatePersonalRecordSuccess,
  GqlParticipationDeleteSuccess,
} from "@/types/graphql";
import { PrismaParticipation, PrismaParticipationDetail } from "@/application/domain/experience/participation/data/type";

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

  static get(r: PrismaParticipation | PrismaParticipationDetail): GqlParticipation {
    return {
      id: r.id,
      status: r.status,
      reason: r.reason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: null,
      community: null,
      reservation: null,
      source: "EXTERNAL", // Default source
      images: 'images' in r && Array.isArray(r.images) ? r.images.map((image: any) => image.url) : [],
      description: null,
      evaluation: null,
      statusHistories: null,
      ticketStatusHistories: null,
      transactions: null
    };
  }

  static create(r: PrismaParticipation | PrismaParticipationDetail): GqlParticipationCreatePersonalRecordSuccess {
    return {
      __typename: "ParticipationCreatePersonalRecordSuccess",
      participation: this.get(r),
    };
  }

  static delete(r: PrismaParticipation | PrismaParticipationDetail): GqlParticipationDeleteSuccess {
    return {
      __typename: "ParticipationDeleteSuccess",
      participationId: r.id,
    };
  }
}
