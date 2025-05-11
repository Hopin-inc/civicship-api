import {
  GqlQueryTicketStatusHistoriesArgs,
  GqlQueryTicketStatusHistoryArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketStatusHistoryUseCase from "@/application/domain/reward/ticket/statusHistory/usecase";
import { PrismaTicketStatusHistoryDetail } from "@/application/domain/reward/ticket/statusHistory/data/type";

const ticketStatusHistoryResolver = {
  Query: {
    ticketStatusHistories: async (
      _: unknown,
      args: GqlQueryTicketStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      return TicketStatusHistoryUseCase.visitorBrowseTicketStatusHistories(ctx, args);
    },

    ticketStatusHistory: async (
      _: unknown,
      args: GqlQueryTicketStatusHistoryArgs,
      ctx: IContext,
    ) => {
      return ctx.loaders.ticketStatusHistory.load(args.id);
    },
  },
  
  TicketStatusHistory: {
    ticket: (parent: PrismaTicketStatusHistoryDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.ticket.load(parent.ticketId);
    },
    
    createdByUser: (parent: PrismaTicketStatusHistoryDetail, _: unknown, ctx: IContext) => {
      return parent.createdBy ? ctx.loaders.user.load(parent.createdBy) : null;
    },
    
    transaction: (parent: PrismaTicketStatusHistoryDetail, _: unknown, ctx: IContext) => {
      return parent.transactionId ? ctx.loaders.transaction.load(parent.transactionId) : null;
    },
  },
};

export default ticketStatusHistoryResolver;
