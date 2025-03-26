import {
  GqlQueryTicketStatusHistoriesArgs,
  GqlQueryTicketStatusHistoryArgs,
  GqlTicketStatusHistory,
  GqlTicketStatusHistoriesConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { TicketStatusHistoryUtils } from "@/application/domain/ticket/statusHistory/utils";
import TicketStatusHistoryService from "@/application/domain/ticket/statusHistory/service";
import TicketStatusHistoryPresenter from "@/application/domain/ticket/statusHistory/presenter";

export default class TicketStatusHistoryUseCase {
  static async visitorBrowseTicketStatusHistories(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryTicketStatusHistoriesArgs,
  ): Promise<GqlTicketStatusHistoriesConnection> {
    return TicketStatusHistoryUtils.fetchTicketStatusHistoriesCommon(ctx, {
      cursor,
      filter,
      sort,
      first,
    });
  }

  static async visitorViewTicketStatusHistory(
    ctx: IContext,
    { id }: GqlQueryTicketStatusHistoryArgs,
  ): Promise<GqlTicketStatusHistory | null> {
    const history = await TicketStatusHistoryService.findTicketStatusHistory(ctx, id);
    if (!history) {
      return null;
    }
    return TicketStatusHistoryPresenter.get(history);
  }
}
