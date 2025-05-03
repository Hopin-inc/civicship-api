import { GqlTicketClaimLink } from "@/types/graphql";
import { PrismaTicketClaimLink, PrismaTicketClaimLinkDetail } from "@/application/domain/reward/ticketClaimLink/data/type";

export default class TicketClaimLinkPresenter {
  static get(r: PrismaTicketClaimLinkDetail): GqlTicketClaimLink {
    return {
      id: r.id,
      claimedAt: null,
      status: r.status,
      createdAt: r.createdAt,
      qty: 1,
      tickets: null,
      issuer: {
        id: r.issuerId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        qtyToBeIssued: 0,
        owner: {
          id: r.issuer?.ownerId || "",
          name: "",
          image: null,
          createdAt: new Date(),
          updatedAt: null,
          sysRole: "USER",
          articlesAboutMe: null,
          articlesWrittenByMe: null,
          bio: null,
          currentPrefecture: null,
          evaluationCreatedByMe: null,
          evaluations: null,
          membershipChangedByMe: null,
          memberships: null,
          opportunitiesCreatedByMe: null,
          participationStatusChangedByMe: null,
          participations: null,
          phoneNumber: null,
          portfolios: null,
          reservationStatusChangedByMe: null,
          reservations: null,
          slug: "",
          ticketStatusChangedByMe: null,
        },
        utility: {
          id: r.issuer?.utilityId || "",
          name: "",
          description: "",
          pointsRequired: 0,
          createdAt: new Date(),
          updatedAt: null,
          community: {
            id: r.issuer?.utility?.communityId || "",
            name: null,
            bio: null,
            createdAt: new Date(),
            updatedAt: null,
            image: null,
            places: null,
            memberships: null,
            opportunities: null,
            participations: null,
            articles: null,
            utilities: null,
            wallets: null,
            establishedAt: null,
            pointName: null,
            website: null
          },
          publishStatus: "PUBLIC",
          images: null,
          requiredForOpportunities: null,
          ticketIssuers: null,
          tickets: null,
        },
        claimLink: null,
      },
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
