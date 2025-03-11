import { IContext } from "@/types/server";
import {
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
  GqlParticipationStatusHistoryFilterInput,
  GqlParticipationStatusHistorySortInput,
} from "@/types/graphql";
import { clampFirst } from "@/utils";
import ParticipationStatusHistoryService from "@/application/participation/statusHistory/service";
import ParticipationStatusHistoryOutputFormat from "@/application/participation/statusHistory/presenter";

export default class ParticipationStatusHistoryUtils {
  static async fetchParticipationStatusHistoriesCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlParticipationStatusHistoryFilterInput;
      sort?: GqlParticipationStatusHistorySortInput;
      first?: number;
    },
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    const take = clampFirst(first);

    const res = await ParticipationStatusHistoryService.fetchStatusHistories(
      ctx,
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = res.length > take;

    const data: GqlParticipationStatusHistory[] = res.slice(0, take).map((record) => {
      return ParticipationStatusHistoryOutputFormat.get(record);
    });

    return ParticipationStatusHistoryOutputFormat.query(data, hasNextPage);
  }
}
