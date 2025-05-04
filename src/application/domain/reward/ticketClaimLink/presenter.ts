import { GqlTicketClaimLink } from "@/types/graphql";
import {
  PrismaTicketClaimLink,
  PrismaTicketClaimLinkDetail,
} from "@/application/domain/reward/ticketClaimLink/data/type";

export default class TicketClaimLinkPresenter {
  static get(r: PrismaTicketClaimLinkDetail): GqlTicketClaimLink {
    return {
      ...r,
      tickets: [],
    };
  }

  static getFromInclude(r: PrismaTicketClaimLink): GqlTicketClaimLink {
    return {
      id: r.id,
      claimedAt: r.claimedAt,
      status: r.status,
      createdAt: r.createdAt,
      qty: r.qty || 1,
      tickets: null,
      issuer: r.issuer,
    };
  }
}
