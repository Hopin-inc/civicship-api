import {
  GqlParticipation,
  GqlParticipationStatusHistoriesArgs,
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
  GqlQueryParticipationStatusHistoriesArgs,
  GqlQueryParticipationStatusHistoryArgs,
  GqlUser,
  GqlUserParticipationStatusChangedByMeArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationStatusHistoryUtils from "@/application/opportunity/participation/statusHistory/utils";
import ParticipationStatusHistoryService from "@/application/opportunity/participation/statusHistory/service";
import ParticipationStatusHistoryOutputFormat from "@/presentation/graphql/dto/opportunity/participation/statusHistory/output";

export default class ParticipationStatusHistoryUseCase {
  static async visitorBrowseParticipationStatusHistories(
    { cursor, filter, sort, first }: GqlQueryParticipationStatusHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    return ParticipationStatusHistoryUtils.fetchParticipationStatusHistoriesCommon(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

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

  static async visitorViewParticipationStatusHistory(
    { id }: GqlQueryParticipationStatusHistoryArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistory | null> {
    const res = await ParticipationStatusHistoryService.findParticipationStatusHistory(ctx, id);
    if (!res) {
      return null;
    }
    return ParticipationStatusHistoryOutputFormat.get(res);
  }
}
