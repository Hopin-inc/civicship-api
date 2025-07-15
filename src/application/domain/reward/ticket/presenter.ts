import {
  GqlTicket,
  GqlTicketClaimSuccess,
  GqlTicketPurchaseSuccess,
  GqlTicketRefundSuccess,
  GqlTicketsConnection,
  GqlTicketUseSuccess,
} from "@/types/graphql";
import { PrismaTicketDetail } from "@/application/domain/reward/ticket/data/type";

export default class TicketPresenter {
  static query(tickets: GqlTicket[], hasNextPage: boolean, cursor?: string): GqlTicketsConnection {
    return {
      __typename: "TicketsConnection",
      totalCount: tickets.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: tickets[0]?.id,
        endCursor: tickets.length ? tickets[tickets.length - 1].id : undefined,
      },
      edges: tickets.map((ticket) => ({
        cursor: ticket.id,
        node: ticket,
      })),
    };
  }

  static get(r: PrismaTicketDetail): GqlTicket {
    return {
      __typename: "Ticket",
      ...r,
    };
  }

  static claim(tickets: PrismaTicketDetail[]): GqlTicketClaimSuccess {
    return {
      __typename: "TicketClaimSuccess",
      tickets: tickets.map(this.get),
    };
  }

  static purchase(r: PrismaTicketDetail): GqlTicketPurchaseSuccess {
    return {
      __typename: "TicketPurchaseSuccess",
      ticket: this.get(r),
    };
  }

  static use(r: PrismaTicketDetail): GqlTicketUseSuccess {
    return {
      __typename: "TicketUseSuccess",
      ticket: this.get(r),
    };
  }

  static refund(r: PrismaTicketDetail): GqlTicketRefundSuccess {
    return {
      __typename: "TicketRefundSuccess",
      ticket: this.get(r),
    };
  }
}
