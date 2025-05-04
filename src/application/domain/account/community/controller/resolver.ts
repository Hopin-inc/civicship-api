import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlMutationCommunityCreateArgs,
  GqlMutationCommunityDeleteArgs,
  GqlMutationCommunityUpdateProfileArgs,
} from "@/types/graphql";
import { PrismaCommunityDetail } from "@/application/domain/account/community/data/type";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import CommunityUseCase from "@/application/domain/account/community/usecase";

@injectable()
export default class CommunityResolver {
  constructor(
    @inject("CommunityUseCase") private readonly communityUseCase: CommunityUseCase,
  ) { }

  Query = {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) => {
      return this.communityUseCase.userBrowseCommunities(args, ctx);
    },
    community: async (_: unknown, args: GqlQueryCommunityArgs, ctx: IContext) => {
      return ctx.loaders.community.load(args.id);
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
    places: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.place.loadMany(parent.places.map((p) => p.id));
    },

    image: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return parent.imageId ? null : null; // No image loader available in context
    },

    memberships: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.membership.loadMany(parent.memberships.map((m) => m.userId + ":" + m.communityId));
    },

    opportunities: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const opportunities = await tx.opportunity.findMany({
          where: { communityId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.opportunity.loadMany(opportunities.map(o => o.id));
      });
    },

    participations: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const participations = await tx.participation.findMany({
          where: { communityId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.participation.loadMany(participations.map(p => p.id));
      });
    },

    wallets: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const wallets = await tx.wallet.findMany({
          where: { communityId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.wallet.loadMany(wallets.map(w => w.id));
      });
    },

    utilities: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const utilities = await tx.utility.findMany({
          where: { communityId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.utility.loadMany(utilities.map(u => u.id));
      });
    },

    articles: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const articles = await tx.article.findMany({
          where: { communityId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.article.loadMany(articles.map(a => a.id));
      });
    },
  };
}
