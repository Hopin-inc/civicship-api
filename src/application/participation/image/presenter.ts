import { GqlParticipationImageBulkUpdateSuccess } from "@/types/graphql";
import { PrismaParticipation } from "@/application/participation/data/type";
import ParticipationPresenter from "@/application/participation/presenter";

export default class ParticipationImsagePresenter {
  static updateImages(participation: PrismaParticipation): GqlParticipationImageBulkUpdateSuccess {
    return {
      __typename: "ParticipationImageBulkUpdateSuccess",
      participation: ParticipationPresenter.get(participation),
    };
  }
}
