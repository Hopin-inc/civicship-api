import {
  GqlQueryUsersArgs,
  GqlQueryUserArgs,
  GqlMutationUserUpdateMyProfileArgs,
  GqlUser,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import UserUseCase from "@/application/domain/account/user/usecase";
import { PrismaUserDetail } from "@/application/domain/account/user/data/type";
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
    image: async (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return parent.imageId ? await ctx.loaders.image.load(parent.imageId) : null;
    },

    identities: (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.identity.loadMany(parent.identities.map((i) => i.uid));
    },

    portfolios: async (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return await this.viewUseCase.visitorBrowsePortfolios(parent, ctx);
    },

    memberships: (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.membership.loadMany(
        parent.memberships.map((m) => `${m.userId}:${m.communityId}`),
      );
    },

    wallets: async (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return await ctx.loaders.wallet.loadMany(parent.wallets.map((w) => w.id));
    },

    ticketStatusChangedByMe: (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.ticketStatusHistory.loadMany(
        parent.ticketStatusChangedByMe.map((h) => h.id),
      );
    },

    opportunitiesCreatedByMe: (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.opportunity.loadMany(parent.opportunitiesCreatedByMe.map((o) => o.id));
    },

    reservations: (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.reservation.loadMany(parent.reservationsAppliedByMe.map((e) => e.id));
    },

    participations: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return parent.participations?.length
        ? ctx.loaders.participation.loadMany(parent.participations.map((p) => p.id))
        : [];
    },

    evaluations: (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.evaluation.loadMany(parent.evaluationsEvaluatedByMe.map((e) => e.id));
    },

    evaluationCreatedByMe: (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.evaluationHistory.loadMany(parent.evaluationCreatedByMe.map((h) => h.id));
    },

    articlesWrittenByMe: async (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return await ctx.loaders.article.loadMany(parent.articlesWrittenByMe.map((a) => a.id));
    },

    articlesAboutMe: async (parent: PrismaUserDetail, _: unknown, ctx: IContext) => {
      return await ctx.loaders.article.loadMany(parent.articlesAboutMe.map((a) => a.id));
    },
  };
}
