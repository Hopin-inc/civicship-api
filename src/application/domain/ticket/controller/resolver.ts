import {
  GqlQueryTicketsArgs,
  GqlQueryTicketArgs,
  GqlMutationTicketPurchaseArgs,
  GqlMutationTicketUseArgs,
  GqlMutationTicketRefundArgs,
  GqlTicket,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketUseCase from "@/application/domain/ticket/usecase";
import TicketStatusHistoryUseCase from "@/application/domain/ticket/statusHistory/usecase";

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

  Ticket: {
    statusHistories: async (parent: GqlTicket, args: GqlQueryTicketArgs, ctx: IContext) => {
      return TicketStatusHistoryUseCase.visitorBrowseTicketStatusHistories(ctx, {
        ...args,
        filter: { ticketId: parent.id },
      });
    },
  },
};
export default ticketResolver;
