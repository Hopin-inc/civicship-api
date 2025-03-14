import { IContext } from "@/types/server";
import {
  GqlUtilitiesConnection,
  GqlUtilityFilterInput,
  GqlUtilitySortInput,
} from "@/types/graphql";
import UtilityService from "@/application/utility/service";
import UtilityPresenter from "@/application/utility/presenter";
import { clampFirst } from "@/application/utils";

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
      return UtilityPresenter.get(record);
    });

    return UtilityPresenter.query(data, hasNextPage);
  },
};
