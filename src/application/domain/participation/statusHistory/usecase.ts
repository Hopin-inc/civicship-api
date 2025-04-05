import {
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
  GqlQueryParticipationStatusHistoriesArgs,
  GqlQueryParticipationStatusHistoryArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationStatusHistoryService from "@/application/domain/participation/statusHistory/service";
import ParticipationStatusHistoryOutputFormat from "@/application/domain/participation/statusHistory/presenter";
import { clampFirst } from "@/application/domain/utils";
import ParticipationStatusHistoryPresenter from "@/application/domain/participation/statusHistory/presenter";

export default class ParticipationStatusHistoryUseCase {
  static async visitorBrowseParticipationStatusHistories(
    { cursor, filter, sort, first }: GqlQueryParticipationStatusHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    const take = clampFirst(first);

    const records = await ParticipationStatusHistoryService.fetchParticipationStatusHistories(
      ctx,
      {
        cursor,
        sort,
        filter,
      },
      take,
    );

    const hasNextPage = records.length > take;
    const data: GqlParticipationStatusHistory[] = records
      .slice(0, take)
      .map((record) => ParticipationStatusHistoryPresenter.get(record));

    return ParticipationStatusHistoryPresenter.query(data, hasNextPage);
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
