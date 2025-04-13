import {
  GqlParticipationsConnection,
  GqlParticipation,
  GqlParticipationCreatePersonalRecordSuccess,
  GqlParticipationDeleteSuccess,
} from "@/types/graphql";
import { PrismaParticipation } from "@/application/domain/participation/data/type";
import UserPresenter from "@/application/domain/user/presenter";

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
    const { user, community, images, ...prop } = r;

    return {
      ...prop,
      user: user ? UserPresenter.get(user) : null,
      community,
      images: images.map((image) => image.url),
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
