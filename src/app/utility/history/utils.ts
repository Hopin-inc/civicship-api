import { IContext } from "@/types/server";
import {
  GqlUtilityHistoriesConnection,
  GqlUtilityHistory,
  GqlUtilityHistoryFilterInput,
  GqlUtilityHistorySortInput,
} from "@/types/graphql";
import { clampFirst } from "@/utils";
import UtilityHistoryService from "@/app/utility/history/service";
import UtilityHistoryOutputFormat from "@/presentation/graphql/dto/utility/history/output";

export default class UtilityHistoryUtils {
  static async fetchUtilityHistoriesCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlUtilityHistoryFilterInput;
      sort?: GqlUtilityHistorySortInput;
      first?: number;
    },
  ): Promise<GqlUtilityHistoriesConnection> {
    const take = clampFirst(first);

    const res = await UtilityHistoryService.fetchUtilityHistories(
      ctx,
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = res.length > take;

    const data: GqlUtilityHistory[] = res.slice(0, take).map((record) => {
      return UtilityHistoryOutputFormat.get(record);
    });

    return UtilityHistoryOutputFormat.query(data, hasNextPage);
  }
}
