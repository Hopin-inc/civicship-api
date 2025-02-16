import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlCommunitiesConnection,
  GqlCommunity,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import CommunityService from "@/application/community/service";
import CommunityOutputFormat from "@/presentation/graphql/dto/community/output";
import { clampFirst } from "@/utils";

export class CommunityQueryUseCase {
  static async userBrowseCommunities(
    { filter, sort, cursor, first }: GqlQueryCommunitiesArgs,
    ctx: IContext,
  ): Promise<GqlCommunitiesConnection> {
    const take = clampFirst(first);
    const res = await CommunityService.fetchCommunities(ctx, { filter, sort, cursor }, take);
    const hasNextPage = res.length > take;
    const data: GqlCommunity[] = res
      .slice(0, take)
      .map((record) => CommunityOutputFormat.get(record));
    return CommunityOutputFormat.query(data, hasNextPage);
  }

  static async userViewCommunity(
    { id }: GqlQueryCommunityArgs,
    ctx: IContext,
  ): Promise<GqlCommunity | null> {
    const res = await CommunityService.findCommunity(ctx, id);
    return res ? CommunityOutputFormat.get(res) : null;
  }
}
