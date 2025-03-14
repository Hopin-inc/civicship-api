import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlCommunitiesConnection,
  GqlCommunity,
  GqlMutationCommunityCreateArgs,
  GqlCommunityCreatePayload,
  GqlMutationCommunityDeleteArgs,
  GqlCommunityDeletePayload,
  GqlMutationCommunityUpdateProfileArgs,
  GqlCommunityUpdateProfilePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import CommunityService from "@/app/community/service";
import CommunityOutputFormat from "@/presentation/graphql/dto/community/output";
import { clampFirst, getCurrentUserId } from "@/utils";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import WalletService from "@/app/membership/wallet/service";

export default class CommunityUseCase {
  private static issuer = new PrismaClientIssuer();

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

  static async userCreateCommunityAndJoin(
    { input }: GqlMutationCommunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlCommunityCreatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const userId = getCurrentUserId(ctx);
      const community = await CommunityService.createCommunityAndJoinAsOwner(ctx, input, tx);

      await WalletService.createCommunityWallet(ctx, community.id, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, userId, community.id, tx);

      return CommunityOutputFormat.create(community);
    });
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
