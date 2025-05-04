import {
  GqlQueryUsersArgs,
  GqlQueryUserArgs,
  GqlMutationUserUpdateMyProfileArgs,
  GqlUser,
  GqlPortfoliosConnection,
  GqlArticlesConnection,
  GqlMembershipsConnection,
  GqlWalletsConnection,
  GqlOpportunitiesConnection,
  GqlParticipationsConnection,
  GqlParticipationStatusHistoriesConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";

import UserUseCase from "@/application/domain/account/user/usecase";
import ViewUseCase from "@/application/view/usecase";
import ArticleUseCase from "@/application/domain/content/article/usecase";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import WalletUseCase from "@/application/domain/account/wallet/usecase";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/domain/experience/participation/statusHistory/usecase";

@injectable()
export default class UserResolver {
  constructor(
    @inject("UserUseCase") private readonly userUseCase: UserUseCase,
    @inject("ViewUseCase") private readonly viewUseCase: ViewUseCase,
    @inject("ArticleUseCase") private readonly articleUseCase: ArticleUseCase,
    @inject("MembershipUseCase") private readonly membershipUseCase: MembershipUseCase,
    @inject("WalletUseCase") private readonly walletUseCase: WalletUseCase,
    @inject("OpportunityUseCase") private readonly opportunityUseCase: OpportunityUseCase,
    @inject("ParticipationUseCase") private readonly participationUseCase: ParticipationUseCase,
    @inject("ParticipationStatusHistoryUseCase")
    private readonly participationStatusHistoryUseCase: ParticipationStatusHistoryUseCase,
  ) {}

  Query = {
    users: (_: unknown, args: GqlQueryUsersArgs, ctx: IContext) =>
      this.userUseCase.visitorBrowseCommunityMembers(ctx, args),

    user: (_: unknown, args: GqlQueryUserArgs, ctx: IContext) =>
      this.userUseCase.visitorViewMember(ctx, args),
  };

  Mutation = {
    userUpdateMyProfile: (_: unknown, args: GqlMutationUserUpdateMyProfileArgs, ctx: IContext) =>
      this.userUseCase.userUpdateProfile(ctx, args),
  };

  User = {
    portfolios: (
      parent: GqlUser,
      args: GqlUserPortfoliosArgs,
      ctx: IContext,
    ): Promise<GqlPortfoliosConnection> =>
      this.viewUseCase.visitorBrowsePortfolios(
        {
          ...args,
          filter: { ...args.filter, userIds: [parent.id] },
        },
        ctx,
      ),

    articlesAboutMe: (
      parent: GqlUser,
      args: GqlUserArticlesAboutMeArgs,
      ctx: IContext,
    ): Promise<GqlArticlesConnection> =>
      this.articleUseCase.anyoneBrowseArticles(ctx, {
        ...args,
        filter: { ...args.filter, authors: [parent.id] },
      }),

    memberships: (
      parent: GqlUser,
      args: GqlUserMembershipsArgs,
      ctx: IContext,
    ): Promise<GqlMembershipsConnection> =>
      this.membershipUseCase.visitorBrowseMemberships(
        {
          ...args,
          filter: { ...args.filter, userId: parent.id },
        },
        ctx,
      ),

    wallets: (
      parent: GqlUser,
      args: GqlUserWalletsArgs,
      ctx: IContext,
    ): Promise<GqlWalletsConnection> =>
      this.walletUseCase.visitorBrowseWallets(
        {
          ...args,
          filter: { ...args.filter, userId: parent.id },
        },
        ctx,
      ),

    opportunitiesCreatedByMe: (
      parent: GqlUser,
      args: GqlUserOpportunitiesCreatedByMeArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> =>
      this.opportunityUseCase.anyoneBrowseOpportunities(
        {
          ...args,
          filter: { ...args.filter, createdByUserIds: [parent.id] },
        },
        ctx,
      ),

    participations: (
      parent: GqlUser,
      args: GqlUserParticipationsArgs,
      ctx: IContext,
    ): Promise<GqlParticipationsConnection> =>
      this.participationUseCase.visitorBrowseParticipations(
        {
          ...args,
          filter: { userIds: [parent.id], ...(args.filter || {}) },
        },
        ctx,
      ),

    participationStatusChangedByMe: (
      parent: GqlUser,
      args: GqlUserParticipationStatusChangedByMeArgs,
      ctx: IContext,
    ): Promise<GqlParticipationStatusHistoriesConnection> =>
      this.participationStatusHistoryUseCase.visitorBrowseParticipationStatusChangedByUser(
        parent,
        args,
        ctx,
      ),
  };
}
