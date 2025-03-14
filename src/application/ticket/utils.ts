import { IContext } from "@/types/server";
import { GqlTicketsConnection, GqlTicketFilterInput, GqlTicketSortInput } from "@/types/graphql";
import TicketService from "@/application/ticket/service";
import TicketPresenter from "@/application/ticket/presenter";
import { clampFirst } from "@/application/utils";

export const TicketUtils = {
  async fetchTicketsCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlTicketFilterInput;
      sort?: GqlTicketSortInput;
      first?: number;
    },
  ): Promise<GqlTicketsConnection> {
    const take = clampFirst(first);
    const res = await TicketService.fetchTickets(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => TicketPresenter.get(record));
    return TicketPresenter.query(data, hasNextPage);
  },
};
