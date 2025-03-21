import { GqlTicketFilterInput, GqlTicketsConnection, GqlTicketSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketRepository from "@/application/ticket/data/repository";
import TicketConverter from "@/application/ticket/data/converter";
import { ParticipationStatus, Prisma, TicketStatus, TicketStatusReason } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { clampFirst, getCurrentUserId } from "@/application/utils";
import TicketPresenter from "@/application/ticket/presenter";
import { PrismaTicket } from "@/application/ticket/data/type";

export default class TicketService {
  static async fetchTickets(
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
    const where = TicketConverter.filter(filter ?? {});
    const orderBy = TicketConverter.sort(sort ?? {});

    const res = await TicketRepository.query(ctx, where, orderBy, take + 1, cursor);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => TicketPresenter.get(record));
    return TicketPresenter.query(data, hasNextPage);
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

  // TODO prismaのcreateManyを使うように変更する
  static async purchaseAndReserveTickets(
    ctx: IContext,
    walletId: string,
    utilityId: string,
    transactionId: string,
    count: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const tickets = await this.purchaseManyTickets(
      ctx,
      walletId,
      utilityId,
      transactionId,
      count,
      tx,
    );
    await this.reserveManyTickets(ctx, tickets, tx);
  }

  static async cancelAndRefundTickets(
    ctx: IContext,
    tickets: PrismaTicket[],
    currentUserId: string,
    transactionId: string,
    participationStatus: ParticipationStatus,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await this.cancelReservedTicketsIfAvailable(
      ctx,
      tickets,
      currentUserId,
      participationStatus,
      tx,
    );
    await this.refundTickets(ctx, tickets, currentUserId, transactionId, tx);
  }

  static async purchaseManyTickets(
    ctx: IContext,
    walletId: string,
    utilityId: string,
    transactionId: string,
    count: number,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicket[]> {
    const currentUserId = getCurrentUserId(ctx);

    const data: Prisma.TicketCreateInput[] = Array.from({ length: count }).map(() =>
      TicketConverter.purchase(currentUserId, walletId, utilityId, transactionId),
    );

    return Promise.all(data.map((input) => TicketRepository.create(ctx, input, tx)));
  }

  static async reserveManyTickets(
    ctx: IContext,
    tickets: PrismaTicket[],
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const currentUserId = getCurrentUserId(ctx);

    await Promise.all(
      tickets.map((ticket) =>
        TicketRepository.update(ctx, ticket.id, TicketConverter.reserve(currentUserId), tx),
      ),
    );
  }

  private static async cancelReservedTicketsIfAvailable(
    ctx: IContext,
    tickets: PrismaTicket[],
    currentUserId: string,
    participationStatus: ParticipationStatus,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    if (participationStatus !== ParticipationStatus.PENDING) return;

    const cancellableTickets = tickets.filter(
      (ticket) =>
        ticket.status === TicketStatus.DISABLED && ticket.reason === TicketStatusReason.RESERVED,
    );

    const data = TicketConverter.cancelReserved(currentUserId);

    await Promise.all(
      cancellableTickets.map((ticket) => TicketRepository.update(ctx, ticket.id, data, tx)),
    );
  }

  private static async refundTickets(
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

  static async useTicket(ctx: IContext, id: string, userId: string, tx?: Prisma.TransactionClient) {
    await this.findTicketOrThrow(ctx, id);

    const data: Prisma.TicketUpdateInput = TicketConverter.use(userId);
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
