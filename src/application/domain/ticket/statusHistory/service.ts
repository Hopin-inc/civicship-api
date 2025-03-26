import { GqlQueryTicketStatusHistoriesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketStatusHistoryConverter from "@/application/domain/ticket/statusHistory/data/converter";
import TicketStatusHistoryRepository from "@/application/domain/ticket/statusHistory/data/repository";

export default class TicketStatusHistoryService {
  static async fetchTicketStatusHistories(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryTicketStatusHistoriesArgs,
    take: number,
  ) {
    const where = TicketStatusHistoryConverter.filter(filter ?? {});
    const orderBy = TicketStatusHistoryConverter.sort(sort ?? {});
    return TicketStatusHistoryRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findTicketStatusHistory(ctx: IContext, id: string) {
    return await TicketStatusHistoryRepository.find(ctx, id);
  }
}
