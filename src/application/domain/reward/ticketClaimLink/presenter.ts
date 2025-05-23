import { GqlTicketClaimLink } from "@/types/graphql";
import { PrismaTicketClaimLink } from "@/application/domain/reward/ticketClaimLink/data/type";

export default class TicketClaimLinkPresenter {
  static get(r: PrismaTicketClaimLink): GqlTicketClaimLink {
    const { issuer, ...prop } = r;

    return {
      __typename: "TicketClaimLink",
      ...prop,
      issuer,
    };
  }
}
