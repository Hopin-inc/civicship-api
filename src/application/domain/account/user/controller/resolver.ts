import {
  GqlQueryUsersArgs,
  GqlQueryUserArgs,
  GqlMutationUserUpdateMyProfileArgs,
  GqlUserPortfoliosArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import UserUseCase from "@/application/domain/account/user/usecase";
import ViewUseCase from "@/application/view/usecase";

@injectable()
export default class UserResolver {
  constructor(
    @inject("UserUseCase") private readonly userUseCase: UserUseCase,
    @inject("ViewUseCase") private readonly viewUseCase: ViewUseCase,
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
    phoneNumber: async (parent, _: unknown, ctx: IContext) => {
      const viewerId = ctx.currentUser?.id;
      if (!viewerId || !parent.id) return null;

      const canView = await this.userUseCase.canCurrentUserViewPhoneNumber(
        ctx,
        parent.id,
        viewerId,
      );
      return canView ? parent.phoneNumber : null;
    },

    portfolios: async (parent, args: GqlUserPortfoliosArgs, ctx: IContext) => {
      if (!parent.id) return [];
      return await this.viewUseCase.visitorBrowsePortfolios(parent, args, ctx);
    },

    image: async (parent, _: unknown, ctx: IContext) => {
      return parent.imageId ? await ctx.loaders.image.load(parent.imageId) : null;
    },

    identities: (parent, _: unknown, ctx: IContext) => {
      const viewerId = ctx.currentUser?.id;
      if (!viewerId || !parent.id) return null;
      return ctx.loaders.identitiesByUser.load(parent.id);
    },

    didIssuanceRequests: (parent, _, ctx: IContext) => {
      return ctx.loaders.didIssuanceRequestsByUser.load(parent.id);
    },

    memberships: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.membershipsByUser.load(parent.id);
    },

    membershipChangedByMe: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.membershipHistoriesByUser.load(parent.id);
    },

    wallets: async (parent, _: unknown, ctx: IContext) => {
      return await ctx.loaders.walletsByUser.load(parent.id);
    },

    ticketStatusChangedByMe: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.ticketStatusHistory.load(parent.id);
    },

    opportunitiesCreatedByMe: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.opportunitiesByUser.load(parent.id);
    },

    reservations: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.reservationsByUser.load(parent.id);
    },

    participations: (parent, _, ctx: IContext) => {
      return ctx.loaders.participationsByUser.load(parent.id);
    },

    evaluations: (parent, _, ctx: IContext) => {
      return ctx.loaders.evaluationsByUser.load(parent.id);
    },

    evaluationCreatedByMe: (parent, _, ctx: IContext) => {
      return ctx.loaders.evaluationHistoriesCreatedByUser.load(parent.id);
    },

    articlesWrittenByMe: (parent, _, ctx: IContext) => {
      return ctx.loaders.articlesWrittenByMe.load(parent.id);
    },

    articlesAboutMe: (parent, _, ctx: IContext) => {
      return ctx.loaders.articlesAboutMe.load(parent.id);
    },

    nftWallet: (parent, _, ctx: IContext) => {
      return ctx.loaders.nftWalletByUserId.load(parent.id);
    },
  };
}
