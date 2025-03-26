import { IContext } from "@/types/server";
import {
  GqlTicketStatusHistoriesConnection,
  GqlTicketStatusHistoryFilterInput,
  GqlTicketStatusHistorySortInput,
} from "@/types/graphql";
import { clampFirst } from "@/application/domain/utils";
import TicketStatusHistoryService from "@/application/domain/ticket/statusHistory/service";
import TicketStatusHistoryPresenter from "@/application/domain/ticket/statusHistory/presenter";

export const TicketStatusHistoryUtils = {
  async fetchTicketStatusHistoriesCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlTicketStatusHistoryFilterInput;
      sort?: GqlTicketStatusHistorySortInput;
      first?: number;
    },
  ): Promise<GqlTicketStatusHistoriesConnection> {
    const take = clampFirst(first);
    const res = await TicketStatusHistoryService.fetchTicketStatusHistories(
      ctx,
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => TicketStatusHistoryPresenter.get(record));
    return TicketStatusHistoryPresenter.query(data, hasNextPage);
  },
};
