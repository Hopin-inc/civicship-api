import {
  GqlTicket,
  GqlTicketClaimSuccess,
  GqlTicketPurchaseSuccess,
  GqlTicketRefundSuccess,
  GqlTicketsConnection,
  GqlTicketUseSuccess,
} from "@/types/graphql";
import { PrismaTicket } from "@/application/domain/ticket/data/type";

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

  static get(r: PrismaTicket): GqlTicket {
    const { utility, wallet, claimLink, ...prop } = r;

    return {
      ...prop,
      utility,
      wallet,
      claimLink,
    };
  }

  static claim(tickets: PrismaTicket[]): GqlTicketClaimSuccess {
    return {
      __typename: "TicketClaimSuccess",
      tickets: tickets.map(this.get),
    };
  }

  static purchase(r: PrismaTicket): GqlTicketPurchaseSuccess {
    return {
      __typename: "TicketPurchaseSuccess",
      ticket: this.get(r),
    };
  }

  static use(r: PrismaTicket): GqlTicketUseSuccess {
    return {
      __typename: "TicketUseSuccess",
      ticket: this.get(r),
    };
  }

  static refund(r: PrismaTicket): GqlTicketRefundSuccess {
    return {
      __typename: "TicketRefundSuccess",
      ticket: this.get(r),
    };
  }
}
