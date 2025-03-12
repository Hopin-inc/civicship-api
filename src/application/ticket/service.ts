import {
  GqlQueryTicketsArgs,
  GqlTicket,
  GqlTicketPurchaseInput,
  GqlTicketUseInput,
  GqlTicketRefundInput,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketRepository from "@/application/ticket/data/repository";
import TicketConverter from "@/application/ticket/data/converter";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/errors/graphql";

export default class TicketService {
  static async fetchTickets(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryTicketsArgs,
    take: number,
  ) {
    const where = TicketConverter.filter(filter ?? {});
    const orderBy = TicketConverter.sort(sort ?? {});
    return TicketRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findTicket(ctx: IContext, id: string) {
    return TicketRepository.find(ctx, id);
  }

  static async findTicketOrThrow(ctx: IContext, id: string): Promise<GqlTicket> {
    const ticket = await TicketRepository.find(ctx, id);
    if (!ticket) {
      throw new NotFoundError("Ticket", { id });
    }
    return ticket;
  }

  static async purchaseTicket(ctx: IContext, input: GqlTicketPurchaseInput) {
    const data: Prisma.TicketCreateInput = TicketConverter.purchase(input);
    return TicketRepository.create(ctx, data);
  }

  static async useTicket(ctx: IContext, id: string, input: GqlTicketUseInput) {
    const data: Prisma.TicketUpdateInput = TicketConverter.use(input);
    return TicketRepository.update(ctx, id, data);
  }

  static async refundTicket(ctx: IContext, id: string, input: GqlTicketRefundInput) {
    const data: Prisma.TicketUpdateInput = TicketConverter.refund(input);
    return TicketRepository.update(ctx, id, data);
  }
}
