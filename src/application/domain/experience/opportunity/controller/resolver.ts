import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";

@injectable()
export default class OpportunityResolver {
  constructor(
    @inject("OpportunityUseCase") private readonly opportunityUseCase: OpportunityUseCase,
  ) {}

  Query = {
    opportunities: (_: unknown, args: GqlQueryOpportunitiesArgs, ctx: IContext) => {
      return this.opportunityUseCase.anyoneBrowseOpportunities(args, ctx);
    },
    opportunity: (_: unknown, args: GqlQueryOpportunityArgs, ctx: IContext) => {
      return this.opportunityUseCase.visitorViewOpportunity(args, ctx);
    },
  };

  Mutation = {
    opportunityCreate: (_: unknown, args: GqlMutationOpportunityCreateArgs, ctx: IContext) => {
      return this.opportunityUseCase.managerCreateOpportunity(args, ctx);
    },
    opportunityDelete: (_: unknown, args: GqlMutationOpportunityDeleteArgs, ctx: IContext) => {
      return this.opportunityUseCase.managerDeleteOpportunity(args, ctx);
    },
    opportunityUpdateContent: (
      _: unknown,
      args: GqlMutationOpportunityUpdateContentArgs,
      ctx: IContext,
    ) => {
      return this.opportunityUseCase.managerUpdateOpportunityContent(args, ctx);
    },
    opportunitySetPublishStatus: (
      _: unknown,
      args: GqlMutationOpportunitySetPublishStatusArgs,
      ctx: IContext,
    ) => {
      return this.opportunityUseCase.managerSetOpportunityPublishStatus(args, ctx);
    },
  };

  Opportunity = {
    community: (parent, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },

    place: (parent, _: unknown, ctx: IContext) => {
      return parent.placeId ? ctx.loaders.place.load(parent.placeId) : null;
    },

    createdByUser: (parent, _: unknown, ctx: IContext) => {
      return parent.createdBy ? ctx.loaders.user.load(parent.createdBy) : null;
    },

    // TODO: これで問題ないかをチェックする
    isReservableWithTicket: (parent, _: unknown, ctx: IContext) => {
      if (!ctx.currentUser) return false;

      return ctx.issuer.internal(async (tx) => {
        const utilities = await tx.utility.findMany({
          where: {
            requiredForOpportunities: {
              some: {
                id: parent.id,
              },
            },
          },
          select: { id: true },
        });

        if (utilities.length === 0) return false;

        const wallet = await tx.wallet.findFirst({
          where: {
            userId: ctx.currentUser?.id,
            communityId: parent.communityId || "",
          },
          select: { id: true },
        });

        if (!wallet) return false;

        const tickets = await tx.ticket.findMany({
          where: {
            walletId: wallet.id,
            utilityId: { in: utilities.map((u) => u.id) },
            status: "AVAILABLE",
          },
          select: { id: true },
        });

        return tickets.length > 0;
      });
    },

    images: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.imagesByOpportunity.load(parent.id);
    },

    requiredUtilities: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.utilitiesByOpportunity.load(parent.id);
    },

    slots: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.opportunitySlotByOpportunity.load(parent.id);
    },

    articles: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.articlesByOpportunity.load(parent.id);
    },
  };
}
