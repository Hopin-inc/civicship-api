import { IContext } from "@/types/server";
import {
  GqlUtilitiesConnection,
  GqlUtilityFilterInput,
  GqlUtilitySortInput,
} from "@/types/graphql";
import UtilityService from "@/domains/utility/service";
import UtilityOutputFormat from "@/domains/utility/presenter/output";
import { clampFirst } from "@/graphql/pagination";

export const UtilityUtils = {
  async fetchUtilitiesCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlUtilityFilterInput;
      sort?: GqlUtilitySortInput;
      first?: number;
    },
  ): Promise<GqlUtilitiesConnection> {
    const take = clampFirst(first);

    const res = await UtilityService.fetchUtilities(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data = res.slice(0, take).map((record) => {
      return UtilityOutputFormat.get(record);
    });

    return UtilityOutputFormat.query(data, hasNextPage);
  },
};
