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
  static query(tickets: GqlTicket[], hasNextPage: boolean): GqlTicketsConnection {
    return {
      totalCount: tickets.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
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
    return r;
  }

  static claim(tickets: PrismaTicketDetail[]): GqlTicketClaimSuccess {
    return {
      tickets: tickets.map(this.get),
    };
  }

  static purchase(r: PrismaTicketDetail): GqlTicketPurchaseSuccess {
    return {
      ticket: this.get(r),
    };
  }

  static use(r: PrismaTicketDetail): GqlTicketUseSuccess {
    return {
      ticket: this.get(r),
    };
  }

  static refund(r: PrismaTicketDetail): GqlTicketRefundSuccess {
    return {
      ticket: this.get(r),
    };
  }
}
