import {
  GqlQueryUsersArgs,
  GqlQueryUserArgs,
  GqlMutationUserUpdateMyProfileArgs,
  GqlUser,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";

import UserUseCase from "@/application/domain/account/user/usecase";

@injectable()
export default class UserResolver {
  constructor(
    @inject("UserUseCase") private readonly userUseCase: UserUseCase,
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
    portfolios: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return [];
    },

    articlesAboutMe: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const articles = await tx.article.findMany({
          where: { authors: { some: { id: parent.id } } },
          select: { id: true },
        });
        return ctx.loaders.article.loadMany(articles.map(a => a.id));
      });
    },

    memberships: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const memberships = await tx.membership.findMany({
          where: { userId: parent.id },
          select: { userId: true, communityId: true },
        });
        return ctx.loaders.membership.loadMany(
          memberships.map(m => `${m.userId}:${m.communityId}`)
        );
      });
    },

    wallets: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const wallets = await tx.wallet.findMany({
          where: { userId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.wallet.loadMany(wallets.map(w => w.id));
      });
    },

    opportunitiesCreatedByMe: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const opportunities = await tx.opportunity.findMany({
          where: { createdBy: parent.id },
          select: { id: true },
        });
        return ctx.loaders.opportunity.loadMany(opportunities.map(o => o.id));
      });
    },

    participations: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const participations = await tx.participation.findMany({
          where: { userId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.participation.loadMany(participations.map(p => p.id));
      });
    },

    participationStatusChangedByMe: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const statusHistories = await tx.participationStatusHistory.findMany({
          where: { createdBy: parent.id },
          select: { id: true },
        });
        return ctx.loaders.participationStatusHistory.loadMany(statusHistories.map(h => h.id));
      });
    },
    
    membershipChangedByMe: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return [];
    },
    
    reservations: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const reservations = await tx.reservation.findMany({
          where: { createdBy: parent.id },
          select: { id: true },
        });
        return ctx.loaders.reservation.loadMany(reservations.map(r => r.id));
      });
    },
    
    reservationStatusChangedByMe: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return [];
    },
    
    evaluations: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const evaluations = await tx.evaluation.findMany({
          where: { evaluatorId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.evaluation.loadMany(evaluations.map(e => e.id));
      });
    },
    
    evaluationCreatedByMe: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const evaluationHistories = await tx.evaluationHistory.findMany({
          where: { createdBy: parent.id },
          select: { id: true },
        });
        return ctx.loaders.evaluationHistory.loadMany(evaluationHistories.map(h => h.id));
      });
    },
    
    articlesWrittenByMe: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const articles = await tx.article.findMany({
          where: { authors: { some: { id: parent.id } } },
          select: { id: true },
        });
        return ctx.loaders.article.loadMany(articles.map(a => a.id));
      });
    },
    
    ticketStatusChangedByMe: (parent: GqlUser, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const ticketStatusHistories = await tx.ticketStatusHistory.findMany({
          where: { createdBy: parent.id },
          select: { id: true },
        });
        return ctx.loaders.ticketStatusHistory.loadMany(ticketStatusHistories.map(h => h.id));
      });
    },
  };
}
