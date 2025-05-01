import { GqlQueryTicketClaimLinkArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketClaimLinkUseCase from "@/application/domain/reward/ticketClaimLink/usecase";

const ticketClaimLinkResolver = {
  Query: {
    ticketClaimLink: async (_: unknown, args: GqlQueryTicketClaimLinkArgs, ctx: IContext) => {
      return TicketClaimLinkUseCase.visitorViewTicketClaimLink(ctx, args.id);
    },
  },
};

export default ticketClaimLinkResolver;
