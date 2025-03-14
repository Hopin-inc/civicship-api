import { IContext } from "@/types/server";
import {
  GqlParticipation,
  GqlParticipationFilterInput,
  GqlParticipationsConnection,
  GqlParticipationSortInput,
} from "@/types/graphql";
import { clampFirst } from "@/application/utils";
import ParticipationService from "@/application/participation/service";
import ParticipationOutputFormat from "@/application/participation/presenter";

export default class ParticipationUtils {
  static async fetchParticipationsCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlParticipationFilterInput;
      sort?: GqlParticipationSortInput;
      first?: number;
    },
  ): Promise<GqlParticipationsConnection> {
    const take = clampFirst(first);

    const res = await ParticipationService.fetchParticipations(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data: GqlParticipation[] = res.slice(0, take).map((record) => {
      return ParticipationOutputFormat.get(record);
    });

    return ParticipationOutputFormat.query(data, hasNextPage);
  }
}
