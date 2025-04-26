import {
  GqlMutationTicketClaimArgs,
  GqlMutationTicketIssueArgs,
  GqlMutationTicketPurchaseArgs,
  GqlMutationTicketRefundArgs,
  GqlMutationTicketUseArgs,
  GqlQueryTicketArgs,
  GqlQueryTicketsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";

const ticketResolver = {
  Query: {
    tickets: async (_: unknown, args: GqlQueryTicketsArgs, ctx: IContext) => {
      return TicketUseCase.visitorBrowseTickets(ctx, args);
    },
    ticket: async (_: unknown, args: GqlQueryTicketArgs, ctx: IContext) => {
      if (!ctx.loaders?.ticket) {
        return TicketUseCase.visitorViewTicket(ctx, args);
      }
      return await ctx.loaders.ticket.load(args.id);
    },
  },

  Mutation: {
    ticketIssue: async (_: unknown, args: GqlMutationTicketIssueArgs, ctx: IContext) => {
      return TicketUseCase.managerIssueTicket(ctx, args);
    },
    ticketClaim: async (_: unknown, args: GqlMutationTicketClaimArgs, ctx: IContext) => {
      return TicketUseCase.userClaimTicket(ctx, args.input);
    },
    ticketPurchase: async (_: unknown, args: GqlMutationTicketPurchaseArgs, ctx: IContext) => {
      return TicketUseCase.memberPurchaseTicket(ctx, args);
    },
    ticketUse: async (_: unknown, args: GqlMutationTicketUseArgs, ctx: IContext) => {
      return TicketUseCase.memberUseTicket(ctx, args);
    },
    ticketRefund: async (_: unknown, args: GqlMutationTicketRefundArgs, ctx: IContext) => {
      return TicketUseCase.memberRefundTicket(ctx, args);
    },
  },
};
export default ticketResolver;
