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
  GqlMutationUpdateSignupBonusConfigArgs,
  GqlMutationUpdatePortalConfigArgs,
} from "@/types/graphql";
import { CommunitySignupBonusConfig } from "@prisma/client";
import { CommunityPortalConfigResult } from "@/application/domain/account/community/config/portal/service";
import { IContext } from "@/types/server";
import CommunityService from "@/application/domain/account/community/service";
import CommunityPresenter from "@/application/domain/account/community/presenter";
import { clampFirst, getCommunityIdFromCtx, getCurrentUserId } from "@/application/domain/utils";
import WalletService from "@/application/domain/account/wallet/service";
import { inject, injectable } from "tsyringe";
import CommunitySignupBonusConfigService from "@/application/domain/account/community/config/incentive/signup/service";
import CommunityPortalConfigService from "@/application/domain/account/community/config/portal/service";
import logger from "@/infrastructure/logging";

@injectable()
export default class CommunityUseCase {
  constructor(
    @inject("CommunityService") private readonly communityService: CommunityService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("CommunitySignupBonusConfigService")
    private readonly signupBonusConfigService: CommunitySignupBonusConfigService,
    @inject("CommunityPortalConfigService")
    private readonly portalConfigService: CommunityPortalConfigService,
  ) {}

  async userBrowseCommunities(
    { filter, sort, cursor, first }: GqlQueryCommunitiesArgs,
    ctx: IContext,
  ): Promise<GqlCommunitiesConnection> {
    const take = clampFirst(first);
    const res = await this.communityService.fetchCommunities(ctx, { filter, sort, cursor }, take);
    const hasNextPage = res.length > take;
    const data: GqlCommunity[] = res.slice(0, take).map((record) => CommunityPresenter.get(record));
    return CommunityPresenter.query(data, hasNextPage, cursor);
  }

  async userViewCommunity(
    { id }: GqlQueryCommunityArgs,
    ctx: IContext,
  ): Promise<GqlCommunity | null> {
    const res = await this.communityService.findCommunity(ctx, id);
    return res ? CommunityPresenter.get(res) : null;
  }

  async userCreateCommunityAndJoin(
    { input }: GqlMutationCommunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlCommunityCreatePayload> {
    const tenantId = await this.communityService.createFirebaseTenant(input.name);

    try {
      return await ctx.issuer.public(ctx, async (tx) => {
        const currentUserId = getCurrentUserId(ctx, input.createdBy);
        const community = await this.communityService.createCommunityAndJoinAsOwner(
          ctx,
          currentUserId,
          input,
          tenantId,
          tx,
        );

        await this.walletService.createCommunityWallet(ctx, community.id, tx);
        await this.walletService.createMemberWalletIfNeeded(ctx, currentUserId, community.id, tx);

        return CommunityPresenter.create(community);
      });
    } catch (err) {
      await this.communityService.deleteFirebaseTenant(tenantId).catch((cleanupErr) => {
        logger.error(
          "Failed to clean up Firebase tenant after community creation failure; manual cleanup required",
          { tenantId, cleanupErr },
        );
      });
      throw err;
    }
  }

  async ownerDeleteCommunity(
    { id }: GqlMutationCommunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlCommunityDeletePayload> {
    const res = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return await this.communityService.deleteCommunity(ctx, id, tx);
    });
    return CommunityPresenter.delete(res);
  }

  async managerUpdateCommunityProfile(
    { id, input }: GqlMutationCommunityUpdateProfileArgs,
    ctx: IContext,
  ): Promise<GqlCommunityUpdateProfilePayload> {
    const res = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return await this.communityService.updateCommunityProfile(ctx, id, input, tx);
    });
    return CommunityPresenter.update(res);
  }

  async managerUpdateSignupBonusConfig(
    { input }: GqlMutationUpdateSignupBonusConfigArgs,
    ctx: IContext,
  ): Promise<CommunitySignupBonusConfig> {
    const communityId = getCommunityIdFromCtx(ctx);
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return this.signupBonusConfigService.update(ctx, communityId, input, tx);
    });
  }

  async managerUpdatePortalConfig(
    { input }: GqlMutationUpdatePortalConfigArgs,
    ctx: IContext,
  ): Promise<CommunityPortalConfigResult> {
    const communityId = getCommunityIdFromCtx(ctx);
    await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      await this.portalConfigService.update(ctx, communityId, input, tx);
    });
    return this.portalConfigService.getPortalConfig(ctx, communityId);
  }
}
