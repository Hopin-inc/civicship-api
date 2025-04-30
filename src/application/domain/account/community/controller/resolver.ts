import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlMutationCommunityCreateArgs,
  GqlMutationCommunityDeleteArgs,
  GqlMutationCommunityUpdateProfileArgs,
  GqlCommunity,
  GqlCommunityMembershipsArgs,
  GqlCommunityOpportunitiesArgs,
  GqlCommunityParticipationsArgs,
  GqlCommunityWalletsArgs,
  GqlCommunityUtilitiesArgs,
  GqlCommunityArticlesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import CommunityUseCase from "@/application/domain/account/community/usecase";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import WalletUseCase from "@/application/domain/account/wallet/usecase";
import UtilityUseCase from "@/application/domain/reward/utility/usecase";
import ArticleUseCase from "@/application/domain/content/article/usecase";

@injectable()
export class CommunityResolver {
  constructor(
    @inject("CommunityUseCase") private readonly communityUseCase: CommunityUseCase,
    @inject("MembershipUseCase") private readonly membershipUseCase: MembershipUseCase,
    @inject("OpportunityUseCase") private readonly opportunityUseCase: OpportunityUseCase,
    @inject("ParticipationUseCase") private readonly participationUseCase: ParticipationUseCase,
    @inject("WalletUseCase") private readonly walletUseCase: WalletUseCase,
    @inject("UtilityUseCase") private readonly utilityUseCase: UtilityUseCase,
    @inject("ArticleUseCase") private readonly articleUseCase: ArticleUseCase,
  ) {}

  Query = {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) => {
      return this.communityUseCase.userBrowseCommunities(args, ctx);
    },
    community: async (_: unknown, args: GqlQueryCommunityArgs, ctx: IContext) => {
      return this.communityUseCase.userViewCommunity(args, ctx);
    },
  };

  Mutation = {
    communityCreate: async (_: unknown, args: GqlMutationCommunityCreateArgs, ctx: IContext) => {
      return this.communityUseCase.userCreateCommunityAndJoin(args, ctx);
    },
    communityDelete: async (_: unknown, args: GqlMutationCommunityDeleteArgs, ctx: IContext) => {
      return this.communityUseCase.ownerDeleteCommunity(args, ctx);
    },
    communityUpdateProfile: async (
      _: unknown,
      args: GqlMutationCommunityUpdateProfileArgs,
      ctx: IContext,
    ) => {
      return this.communityUseCase.managerUpdateCommunityProfile(args, ctx);
    },
  };

  Community = {
    memberships: async (parent: GqlCommunity, args: GqlCommunityMembershipsArgs, ctx: IContext) => {
      return this.membershipUseCase.visitorBrowseMemberships(
        { ...args, filter: { ...args.filter, communityId: parent.id } },
        ctx,
      );
    },

    opportunities: async (
      parent: GqlCommunity,
      args: GqlCommunityOpportunitiesArgs,
      ctx: IContext,
    ) => {
      return this.opportunityUseCase.anyoneBrowseOpportunities(
        { ...args, filter: { ...args.filter, communityIds: [parent.id] } },
        ctx,
      );
    },

    participations: async (
      parent: GqlCommunity,
      args: GqlCommunityParticipationsArgs,
      ctx: IContext,
    ) => {
      return this.participationUseCase.visitorBrowseParticipations(
        { ...args, filter: { communityId: parent.id } },
        ctx,
      );
    },

    wallets: async (parent: GqlCommunity, args: GqlCommunityWalletsArgs, ctx: IContext) => {
      return this.walletUseCase.visitorBrowseWallets(
        { ...args, filter: { ...args.filter, communityId: parent.id } },
        ctx,
      );
    },

    utilities: async (parent: GqlCommunity, args: GqlCommunityUtilitiesArgs, ctx: IContext) => {
      return this.utilityUseCase.anyoneBrowseUtilities(ctx, {
        ...args,
        filter: { ...args.filter, communityId: parent.id },
      });
    },

    articles: async (parent: GqlCommunity, args: GqlCommunityArticlesArgs, ctx: IContext) => {
      return this.articleUseCase.anyoneBrowseArticles(ctx, {
        ...args,
        filter: { ...args.filter, communityId: parent.id },
      });
    },
  };
}
