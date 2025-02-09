import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlMutationCommunityCreateArgs,
  GqlMutationCommunityDeleteArgs,
  GqlMutationCommunityUpdateProfileArgs,
  GqlCommunitiesConnection,
  GqlCommunity,
  GqlCommunityCreatePayload,
  GqlCommunityDeletePayload,
  GqlCommunityUpdateProfilePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import CommunityService from "@/domains/community/service";
import CommunityOutputFormat from "@/domains/community/presenter/output";

export default class CommunityUseCase {
  static async userBrowseCommunities(
    { filter, sort, cursor, first }: GqlQueryCommunitiesArgs,
    ctx: IContext,
  ): Promise<GqlCommunitiesConnection> {
    const take = first ?? 10;
    const res = await CommunityService.fetchCommunities(ctx, { filter, sort, cursor }, take);
    const hasNextPage = res.length > take;

    const data: GqlCommunity[] = res.slice(0, take).map((record) => {
      return CommunityOutputFormat.get(record);
    });
    return CommunityOutputFormat.query(data, hasNextPage);
  }

  static async userViewCommunity(
    { id }: GqlQueryCommunityArgs,
    ctx: IContext,
  ): Promise<GqlCommunity | null> {
    const res = await CommunityService.findCommunity(ctx, id);
    if (!res) {
      return null;
    }
    return CommunityOutputFormat.get(res);
  }

  static async userCreateCommunity(
    { input }: GqlMutationCommunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlCommunityCreatePayload> {
    const res = await CommunityService.createCommunity(ctx, input);
    return CommunityOutputFormat.create(res);
  }

  static async managerDeleteCommunity(
    { id }: GqlMutationCommunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlCommunityDeletePayload> {
    const res = await CommunityService.deleteCommunity(ctx, id);
    return CommunityOutputFormat.delete(res);
  }

  static async managerUpdateCommunityProfile(
    { id, input }: GqlMutationCommunityUpdateProfileArgs,
    ctx: IContext,
  ): Promise<GqlCommunityUpdateProfilePayload> {
    const res = await CommunityService.updateCommunityProfile(ctx, id, input);
    return CommunityOutputFormat.update(res);
  }
}
