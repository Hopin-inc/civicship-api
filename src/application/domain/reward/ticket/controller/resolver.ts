import {
  GqlMutationTicketClaimArgs,
  GqlMutationTicketIssueArgs,
  GqlMutationTicketPurchaseArgs,
  GqlMutationTicketRefundArgs,
  GqlMutationTicketUseArgs,
  GqlQueryTicketArgs,
  GqlQueryTicketsArgs,
} from "@/types/graphql";
import { PrismaTicketDetail } from "@/application/domain/reward/ticket/data/type";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";

@injectable()
export default class TicketResolver {
  constructor(@inject("TicketUseCase") private readonly ticketUseCase: TicketUseCase) { }

  Query = {
    tickets: (_: unknown, args: GqlQueryTicketsArgs, ctx: IContext) => {
      return this.ticketUseCase.visitorBrowseTickets(ctx, args);
    },

    ticket: (_: unknown, args: GqlQueryTicketArgs, ctx: IContext) => {
      return ctx.loaders.ticket.load(args.id);
    },
  };

  Mutation = {
    ticketIssue: (_: unknown, args: GqlMutationTicketIssueArgs, ctx: IContext) => {
      return this.ticketUseCase.managerIssueTicket(ctx, args);
    },

    ticketClaim: (_: unknown, args: GqlMutationTicketClaimArgs, ctx: IContext) => {
      return this.ticketUseCase.userClaimTicket(ctx, args.input);
    },

    ticketPurchase: (_: unknown, args: GqlMutationTicketPurchaseArgs, ctx: IContext) => {
      return this.ticketUseCase.memberPurchaseTicket(ctx, args);
    },

    ticketUse: (_: unknown, args: GqlMutationTicketUseArgs, ctx: IContext) => {
      return this.ticketUseCase.memberUseTicket(ctx, args);
    },

    ticketRefund: (_: unknown, args: GqlMutationTicketRefundArgs, ctx: IContext) => {
      return this.ticketUseCase.memberRefundTicket(ctx, args);
    },
  };

  Ticket = {
    utility: (parent: PrismaTicketDetail, _: unknown, ctx: IContext) => {
      return parent.utilityId ? ctx.loaders.utility.load(parent.utilityId) : null;
    },

    wallet: (parent: PrismaTicketDetail, _: unknown, ctx: IContext) => {
      return parent.walletId ? ctx.loaders.wallet.load(parent.walletId) : null;
    },

    claimLink: (parent: PrismaTicketDetail, _: unknown, ctx: IContext) => {
      return parent.claimLinkId ? ctx.loaders.ticketClaimLink.load(parent.claimLinkId) : null;
    },

    ticketStatusHistories: (parent: PrismaTicketDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.ticketStatusHistory.loadMany(parent.ticketStatusHistories.map(h => h.id));
    },
  };
}
