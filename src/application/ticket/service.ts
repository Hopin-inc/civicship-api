import { GqlQueryTicketsArgs, GqlTicket } from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketRepository from "@/application/ticket/data/repository";
import TicketConverter from "@/application/ticket/data/converter";
import { ParticipationStatus, Prisma, TicketStatus, TicketStatusReason } from "@prisma/client";
import { NotFoundError } from "@/errors/graphql";
import { getCurrentUserId } from "@/application/utils";

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

  static async purchaseTicket(
    ctx: IContext,
    walletId: string,
    utilityId: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);

    const data: Prisma.TicketCreateInput = TicketConverter.purchase(
      currentUserId,
      walletId,
      utilityId,
      transactionId,
    );
    return TicketRepository.create(ctx, data, tx);
  }

  static async reserveOrUseTicket(
    ctx: IContext,
    participationStatus: ParticipationStatus,
    ticketId: string,
    tx: Prisma.TransactionClient,
  ) {
    switch (participationStatus) {
      case ParticipationStatus.PENDING:
        await this.reserveTicket(ctx, ticketId, tx);
        break;
      case ParticipationStatus.PARTICIPATING:
        await this.useTicket(ctx, ticketId, tx);
        break;
      default:
        break;
    }
  }

  static async cancelReservedTicketIfNeeded(
    ctx: IContext,
    ticketId: string,
    tx: Prisma.TransactionClient,
    participationStatus: ParticipationStatus,
  ): Promise<void> {
    const ticket = await this.findTicketOrThrow(ctx, ticketId);
    if (
      participationStatus === ParticipationStatus.PENDING &&
      ticket.status === TicketStatus.DISABLED &&
      ticket.reason === TicketStatusReason.RESERVED
    ) {
      await this.cancelReservedTicket(ctx, ticketId, tx);
    }
  }

  static async useTicketIfAvailable(
    ctx: IContext,
    ticketId: string,
    tx: Prisma.TransactionClient,
    participationStatus: ParticipationStatus,
  ): Promise<void> {
    const ticket = await TicketService.findTicketOrThrow(ctx, ticketId);

    if (
      participationStatus === ParticipationStatus.PENDING &&
      ticket.status === TicketStatus.AVAILABLE
    ) {
      await TicketService.useTicket(ctx, ticketId, tx);
    }
  }

  static async reserveTicket(ctx: IContext, id: string, tx?: Prisma.TransactionClient) {
    const currentUserId = getCurrentUserId(ctx);

    const data: Prisma.TicketUpdateInput = TicketConverter.reserve(currentUserId);
    return TicketRepository.update(ctx, id, data, tx);
  }

  static async cancelReservedTicket(ctx: IContext, id: string, tx?: Prisma.TransactionClient) {
    const currentUserId = getCurrentUserId(ctx);

    const data: Prisma.TicketUpdateInput = TicketConverter.cancelReserved(currentUserId);
    return TicketRepository.update(ctx, id, data, tx);
  }

  static async useTicket(ctx: IContext, id: string, tx?: Prisma.TransactionClient) {
    const currentUserId = getCurrentUserId(ctx);

    const data: Prisma.TicketUpdateInput = TicketConverter.use(currentUserId);
    return TicketRepository.update(ctx, id, data, tx);
  }

  static async refundTicket(
    ctx: IContext,
    id: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    await this.findTicketOrThrow(ctx, id);

    const data: Prisma.TicketUpdateInput = TicketConverter.refund(currentUserId, transactionId);
    return TicketRepository.update(ctx, id, data, tx);
  }
}
