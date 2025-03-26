import { GqlQueryTicketsArgs, GqlTicketsConnection } from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketRepository from "@/application/domain/ticket/data/repository";
import TicketConverter from "@/application/domain/ticket/data/converter";
import { Prisma, TicketStatus, TicketStatusReason } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import TicketPresenter from "@/application/domain/ticket/presenter";
import { PrismaTicket } from "@/application/domain/ticket/data/type";

export default class TicketService {
  static async fetchTickets(
    ctx: IContext,
    { first, sort, filter, cursor }: GqlQueryTicketsArgs,
  ): Promise<GqlTicketsConnection> {
    const take = clampFirst(first);
    const where = TicketConverter.filter(filter ?? {});
    const orderBy = TicketConverter.sort(sort ?? {});

    const res = await TicketRepository.query(ctx, where, orderBy, take + 1, cursor);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => TicketPresenter.get(record));
    return TicketPresenter.query(data, hasNextPage);
  }

  static async fetchTicketsByIds(ctx: IContext, ids: string[]) {
    return await TicketRepository.queryByIds(ctx, ids);
  }

  static async findTicket(ctx: IContext, id: string) {
    return TicketRepository.find(ctx, id);
  }

  static async findTicketOrThrow(ctx: IContext, id: string): Promise<PrismaTicket> {
    const ticket = await TicketRepository.find(ctx, id);
    if (!ticket) {
      throw new NotFoundError("Ticket", { id });
    }
    return ticket;
  }

  static async purchaseManyTickets(
    ctx: IContext,
    walletId: string,
    utilityId: string,
    transactionId: string,
    participationIds: string[],
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicket[]> {
    const currentUserId = getCurrentUserId(ctx);

    const data: Prisma.TicketCreateInput[] = participationIds.map((participationId) =>
      TicketConverter.purchase(currentUserId, walletId, utilityId, transactionId, participationId),
    );

    return Promise.all(data.map((d) => TicketRepository.create(ctx, d, tx)));
  }

  static async reserveManyTickets(
    ctx: IContext,
    tickets: PrismaTicket[],
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const currentUserId = getCurrentUserId(ctx);

    const inputs = tickets.map((ticket) => ({
      id: ticket.id,
      data: TicketConverter.reserve(currentUserId),
    }));

    await Promise.all(inputs.map(({ id, data }) => TicketRepository.update(ctx, id, data, tx)));
  }

  static async cancelReservedTicketsIfAvailable(
    ctx: IContext,
    tickets: PrismaTicket[],
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const cancellableTickets = tickets.filter(
      (ticket) =>
        ticket.status === TicketStatus.DISABLED && ticket.reason === TicketStatusReason.RESERVED,
    );

    const data = TicketConverter.cancelReserved(currentUserId);

    await Promise.all(
      cancellableTickets.map((ticket) => TicketRepository.update(ctx, ticket.id, data, tx)),
    );
  }

  static async refundTickets(
    ctx: IContext,
    tickets: PrismaTicket[],
    currentUserId: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await Promise.all(
      tickets.map((ticket) =>
        TicketRepository.update(
          ctx,
          ticket.id,
          TicketConverter.refund(currentUserId, transactionId),
          tx,
        ),
      ),
    );
  }

  static async purchaseTicket(
    ctx: IContext,
    walletId: string,
    utilityId: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicket> {
    const currentUserId = getCurrentUserId(ctx);

    const data = TicketConverter.purchase(currentUserId, walletId, utilityId, transactionId);
    return TicketRepository.create(ctx, data, tx);
  }

  static async refundTicket(
    ctx: IContext,
    id: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicket> {
    const currentUserId = getCurrentUserId(ctx);
    await this.findTicketOrThrow(ctx, id);

    const data = TicketConverter.refund(currentUserId, transactionId);
    return TicketRepository.update(ctx, id, data, tx);
  }

  static async useTicket(ctx: IContext, id: string, tx?: Prisma.TransactionClient) {
    const currentUserId = getCurrentUserId(ctx);
    await this.findTicketOrThrow(ctx, id);

    const data: Prisma.TicketUpdateInput = TicketConverter.use(currentUserId);
    return TicketRepository.update(ctx, id, data, tx);
  }

  static validateTicketForReservation(ticket: PrismaTicket, requiredUtilityIds: string[]) {
    const { utilityId, status } = ticket;

    if (!requiredUtilityIds.includes(utilityId)) {
      throw new ValidationError("Ticket is not valid for the required utilities.");
    }

    if (status === TicketStatus.DISABLED) {
      throw new ValidationError("This ticket has already been used.");
    }
  }
}
