import { GqlParticipationStatusHistory } from "@/types/graphql";
import { PrismaParticipationStatusHistoryDetail } from "@/application/domain/experience/participation/statusHistory/data/type";

export default class ParticipationStatusHistoryPresenter {
  static get(r: PrismaParticipationStatusHistoryDetail): GqlParticipationStatusHistory {
    return r;
  }
}
