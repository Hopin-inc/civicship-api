import { GqlTicketClaimLink, GqlTicketClaimLinksConnection } from "@/types/graphql";
import { PrismaTicketClaimLink, PrismaTicketClaimLinkDetail } from "@/application/domain/reward/ticketClaimLink/data/type";

export default class TicketClaimLinkPresenter {
  static get(r: PrismaTicketClaimLink): GqlTicketClaimLink {
    const { issuer, ...prop } = r;

    return {
      __typename: "TicketClaimLink",
      ...prop,
      issuer,
    };
  }

  static getDetail(r: PrismaTicketClaimLinkDetail): GqlTicketClaimLink {
    return {
      __typename: "TicketClaimLink",
      ...r,
    };
  }

  static query(data: GqlTicketClaimLink[], hasNextPage: boolean): GqlTicketClaimLinksConnection {
    return {
      __typename: "TicketClaimLinksConnection",
      edges: data.map((node) => ({
        __typename: "TicketClaimLinkEdge",
        cursor: node.id,
        node,
      })),
      pageInfo: {
        __typename: "PageInfo",
        hasNextPage,
        hasPreviousPage: false,
        startCursor: data.length > 0 ? data[0].id : null,
        endCursor: data.length > 0 ? data[data.length - 1].id : null,
      },
      totalCount: data.length,
    };
  }
}
