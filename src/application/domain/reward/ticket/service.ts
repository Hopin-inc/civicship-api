import { inject, injectable } from "tsyringe";
import { GqlQueryTicketsArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { ITicketRepository } from "@/application/domain/reward/ticket/data/interface";
import { Prisma } from "@prisma/client";
import { NotFoundError, ValidationError, TicketParticipantMismatchError } from "@/errors/graphql";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import TicketPresenter from "@/application/domain/reward/ticket/presenter";
import { PrismaTicket } from "@/application/domain/reward/ticket/data/type";
import { PrismaTicketClaimLink } from "@/application/domain/reward/ticketClaimLink/data/type";
import TicketConverter from "@/application/domain/reward/ticket/data/converter";

@injectable()
export default class TicketService {
  constructor(
    @inject("TicketRepository") private readonly repository: ITicketRepository,
    @inject("TicketConverter") private readonly converter: TicketConverter,
  ) {}

  async fetchTickets(ctx: IContext, { first, sort, filter, cursor }: GqlQueryTicketsArgs) {
    const take = clampFirst(first);
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    const res = await this.repository.query(ctx, where, orderBy, take + 1, cursor);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => TicketPresenter.get(record));
    return TicketPresenter.query(data, hasNextPage);
  }

  async fetchTicketsByIds(ctx: IContext, ids: string[]) {
    return await this.repository.queryByIds(ctx, ids);
  }

  async findTicket(ctx: IContext, id: string) {
    return this.repository.find(ctx, id);
  }

  async findTicketOrThrow(ctx: IContext, id: string) {
    const ticket = await this.repository.find(ctx, id);
    if (!ticket) {
      throw new NotFoundError("Ticket", { id });
    }
    return ticket;
  }

  async claimTicketsByIssuerId(
    ctx: IContext,
    currentUserId: string,
    claimLinkId: string,
    issuedTicket: PrismaTicketClaimLink["issuer"],
    walletId: string,
    tx: Prisma.TransactionClient,
  ) {
    const dataList: Prisma.TicketCreateInput[] = Array.from({
      length: issuedTicket.qtyToBeIssued,
    }).map(() => this.converter.claim(currentUserId, claimLinkId, issuedTicket, walletId));

    return Promise.all(dataList.map((data) => this.repository.create(ctx, data, tx)));
  }

  async reserveManyTickets(
    ctx: IContext,
    participationIds: string[],
    tx: Prisma.TransactionClient,
    ticketIds?: string[],
  ) {
    const currentUserId = getCurrentUserId(ctx);
    if (!ticketIds) throw new ValidationError("Ticket IDs are not provided");

    if (ticketIds.length !== participationIds.length) {
      throw new TicketParticipantMismatchError(ticketIds.length, participationIds.length);
    }

    const updates = ticketIds.map((ticketId, index) => ({
      id: ticketId,
      data: this.converter.reserve(currentUserId, participationIds[index]),
    }));

    return await Promise.all(
      updates.map(({ id, data }) => this.repository.update(ctx, id, data, tx)),
    );
  }

  async cancelReservedTicketsIfAvailable(
    ctx: IContext,
    tickets: PrismaTicket[],
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ) {
    const cancellableTickets = tickets.filter(
      (ticket) =>
        ticket.status === "DISABLED" && ticket.reason === "RESERVED",
    );

    const data = this.converter.cancelReserved(currentUserId);

    await Promise.all(
      cancellableTickets.map((ticket) => this.repository.update(ctx, ticket.id, data, tx)),
    );
  }

  async refundTickets(
    ctx: IContext,
    tickets: PrismaTicket[],
    currentUserId: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ) {
    await Promise.all(
      tickets.map((ticket) =>
        this.repository.update(
          ctx,
          ticket.id,
          this.converter.refund(currentUserId, transactionId),
          tx,
        ),
      ),
    );
  }

  async purchaseTicket(
    ctx: IContext,
    walletId: string,
    utilityId: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);

    const data = this.converter.purchase(currentUserId, walletId, utilityId, transactionId);
    return this.repository.create(ctx, data, tx);
  }

  async refundTicket(
    ctx: IContext,
    id: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    await this.findTicketOrThrow(ctx, id);

    const data = this.converter.refund(currentUserId, transactionId);
    return this.repository.update(ctx, id, data, tx);
  }

  async useTicket(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    const currentUserId = getCurrentUserId(ctx);
    await this.findTicketOrThrow(ctx, id);

    const data: Prisma.TicketUpdateInput = this.converter.use(currentUserId);
    return this.repository.update(ctx, id, data, tx);
  }
}
