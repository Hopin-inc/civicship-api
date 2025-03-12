import {
  GqlQueryTicketStatusHistoriesArgs,
  GqlQueryTicketStatusHistoryArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketStatusHistoryUseCase from "@/application/ticket/statusHistory/usecase";

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
      if (!ctx.loaders?.ticketStatusHistory) {
        return TicketStatusHistoryUseCase.visitorViewTicketStatusHistory(ctx, args);
      }
      return ctx.loaders.ticketStatusHistory.load(args.id);
    },
  },
};

export default ticketStatusHistoryResolver;
