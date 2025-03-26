import { GqlParticipationImageBulkUpdateSuccess } from "@/types/graphql";
import { PrismaParticipation } from "@/application/domain/participation/data/type";
import ParticipationPresenter from "@/application/domain/participation/presenter";

export default class ParticipationImsagePresenter {
  static updateImages(participation: PrismaParticipation): GqlParticipationImageBulkUpdateSuccess {
    return {
      __typename: "ParticipationImageBulkUpdateSuccess",
      participation: ParticipationPresenter.get(participation),
    };
  }
}
