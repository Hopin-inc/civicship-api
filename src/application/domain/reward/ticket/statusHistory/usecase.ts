import {
  GqlQueryTicketStatusHistoriesArgs,
  GqlQueryTicketStatusHistoryArgs,
  GqlTicketStatusHistoriesConnection,
  GqlTicketStatusHistory,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketStatusHistoryService from "@/application/domain/reward/ticket/statusHistory/service";
import TicketStatusHistoryPresenter from "@/application/domain/reward/ticket/statusHistory/presenter";
import { clampFirst } from "@/application/domain/utils";

export default class TicketStatusHistoryUseCase {
  static async visitorBrowseTicketStatusHistories(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryTicketStatusHistoriesArgs,
  ): Promise<GqlTicketStatusHistoriesConnection> {
    const take = clampFirst(first);
    const res = await TicketStatusHistoryService.fetchTicketStatusHistories(
      ctx,
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => TicketStatusHistoryPresenter.get(record));
    return TicketStatusHistoryPresenter.query(data, hasNextPage, cursor);
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
