import {
  GqlParticipation,
  GqlParticipationStatusHistoriesArgs,
  GqlParticipationStatusHistoriesConnection,
  GqlUser,
  GqlUserParticipationStatusChangedByMeArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationStatusHistoryUtils from "@/domains/opportunity/participationStatusHistory/utils";

export default class ParticipationStatusHistoryUseCase {
  static async visitorBrowseStatusHistoriesByParticipation(
    { id }: GqlParticipation,
    { first, cursor }: GqlParticipationStatusHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    return ParticipationStatusHistoryUtils.fetchParticipationStatusHistoriesCommon(ctx, {
      cursor,
      filter: { participationId: id },
      first,
    });
  }

  static async visitorBrowseParticipationStatusChangedByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserParticipationStatusChangedByMeArgs,
    ctx: IContext,
  ) {
    return ParticipationStatusHistoryUtils.fetchParticipationStatusHistoriesCommon(ctx, {
      cursor,
      filter: { createdById: id },
      first,
    });
  }
}
