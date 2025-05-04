import { GqlTicketIssuePayload, GqlTicketIssuer } from "@/types/graphql";
import { PrismaTicketIssuerDetail } from "@/application/domain/reward/ticketIssuer/data/type";

export default class TicketIssuerPresenter {
  static get(r: PrismaTicketIssuerDetail): GqlTicketIssuer {
    return r;
  }

  static issue(r: PrismaTicketIssuerDetail): GqlTicketIssuePayload {
    return {
      __typename: "TicketIssueSuccess",
      issue: this.get(r),
    };
  }
}
