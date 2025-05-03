import { GqlTicketIssuePayload, GqlTicketIssuer } from "@/types/graphql";
import { PrismaTicketIssuer, PrismaTicketIssuerDetail } from "@/application/domain/reward/ticketIssuer/data/type";
import TicketClaimLinkPresenter from "@/application/domain/reward/ticketClaimLink/presenter";

export default class TicketIssuerPresenter {
  static get(r: PrismaTicketIssuerDetail | PrismaTicketIssuer): GqlTicketIssuer {
    if ('claimLink' in r && r.claimLink && typeof r.claimLink !== 'string') {
      const { claimLink, utility, owner, ...prop } = r as PrismaTicketIssuer;
      return {
        ...prop,
        claimLink: claimLink ? TicketClaimLinkPresenter.getFromInclude(claimLink) : null,
        utility,
        owner,
      };
    } else {
      return {
        id: r.id,
        qtyToBeIssued: r.qtyToBeIssued,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        claimLink: null,
        utility: {
          id: r.utilityId || "",
          name: "",
          description: "",
          pointsRequired: 0,
          createdAt: new Date(),
          updatedAt: null,
          community: {
            id: r.utility?.communityId || "",
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
        owner: {
          id: r.ownerId || "",
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
      };
    }
  }

  static issue(r: PrismaTicketIssuer): GqlTicketIssuePayload {
    return {
      __typename: "TicketIssueSuccess",
      issue: this.get(r),
    };
  }
}
