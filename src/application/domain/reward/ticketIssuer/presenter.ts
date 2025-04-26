import { GqlTicketIssuePayload, GqlTicketIssuer } from "@/types/graphql";
import { PrismaTicketIssuer } from "@/application/domain/reward/ticketIssuer/data/type";
import TicketClaimLinkPresenter from "@/application/domain/reward/ticketClaimLink/presenter";

export default class TicketIssuerPresenter {
  static get(r: PrismaTicketIssuer): GqlTicketIssuer {
    const { claimLink, utility, owner, ...prop } = r;

    return {
      ...prop,
      claimLink: claimLink ? TicketClaimLinkPresenter.get(claimLink) : null,
      utility,
      owner,
    };
  }

  static issue(r: PrismaTicketIssuer): GqlTicketIssuePayload {
    return {
      __typename: "TicketIssueSuccess",
      issue: this.get(r),
    };
  }
}
