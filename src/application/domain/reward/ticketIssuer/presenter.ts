import {
  GqlTicketIssuePayload,
  GqlTicketIssuer,
  GqlTicketIssuersConnection,
} from "@/types/graphql";
import { PrismaTicketIssuerDetail } from "@/application/domain/reward/ticketIssuer/data/type";

export default class TicketIssuerPresenter {
  static query(records: GqlTicketIssuer[], hasNextPage: boolean): GqlTicketIssuersConnection {
    return {
      totalCount: records.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: records[0]?.id,
        endCursor: records.length ? records[records.length - 1].id : undefined,
      },
      edges: records.map((record) => ({
        cursor: record.id,
        node: record,
      })),
    };
  }

  static get(r: PrismaTicketIssuerDetail): GqlTicketIssuer {
    return r;
  }

  static issue(r: PrismaTicketIssuerDetail): GqlTicketIssuePayload {
    return {
      issue: this.get(r),
    };
  }
}
