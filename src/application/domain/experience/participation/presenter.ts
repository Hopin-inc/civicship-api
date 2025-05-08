import {
  GqlParticipationsConnection,
  GqlParticipation,
  GqlParticipationCreatePersonalRecordSuccess,
  GqlParticipationDeleteSuccess,
} from "@/types/graphql";
import { PrismaParticipationDetail } from "@/application/domain/experience/participation/data/type";

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

  static get(r: PrismaParticipationDetail): GqlParticipation {
    const { images, ...prop } = r;

    return {
      ...prop,
      images: images.map((i) => i.id),
      statusHistories: [],
    };
  }

  static create(r: PrismaParticipationDetail): GqlParticipationCreatePersonalRecordSuccess {
    return {
      participation: this.get(r),
    };
  }

  static delete(r: PrismaParticipationDetail): GqlParticipationDeleteSuccess {
    return {
      participationId: r.id,
    };
  }
}
