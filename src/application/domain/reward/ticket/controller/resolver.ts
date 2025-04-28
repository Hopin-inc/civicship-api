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
import { container } from "tsyringe";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";

const ticketResolver = {
  Query: {
    tickets: async (_: unknown, args: GqlQueryTicketsArgs, ctx: IContext) => {
      const ticketUseCase = container.resolve(TicketUseCase);
      return ticketUseCase.visitorBrowseTickets(ctx, args);
    },
    ticket: async (_: unknown, args: GqlQueryTicketArgs, ctx: IContext) => {
      if (!ctx.loaders?.ticket) {
        const ticketUseCase = container.resolve(TicketUseCase);
        return ticketUseCase.visitorViewTicket(ctx, args);
      }
      return await ctx.loaders.ticket.load(args.id);
    },
  },

  Mutation: {
    ticketIssue: async (_: unknown, args: GqlMutationTicketIssueArgs, ctx: IContext) => {
      const ticketUseCase = container.resolve(TicketUseCase);
      return ticketUseCase.managerIssueTicket(ctx, args);
    },
    ticketClaim: async (_: unknown, args: GqlMutationTicketClaimArgs, ctx: IContext) => {
      const ticketUseCase = container.resolve(TicketUseCase);
      return ticketUseCase.userClaimTicket(ctx, args.input);
    },
    ticketPurchase: async (_: unknown, args: GqlMutationTicketPurchaseArgs, ctx: IContext) => {
      const ticketUseCase = container.resolve(TicketUseCase);
      return ticketUseCase.memberPurchaseTicket(ctx, args);
    },
    ticketUse: async (_: unknown, args: GqlMutationTicketUseArgs, ctx: IContext) => {
      const ticketUseCase = container.resolve(TicketUseCase);
      return ticketUseCase.memberUseTicket(ctx, args);
    },
    ticketRefund: async (_: unknown, args: GqlMutationTicketRefundArgs, ctx: IContext) => {
      const ticketUseCase = container.resolve(TicketUseCase);
      return ticketUseCase.memberRefundTicket(ctx, args);
    },
  },
};

export default ticketResolver;
