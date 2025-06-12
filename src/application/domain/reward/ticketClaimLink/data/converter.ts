import { GqlTicketClaimLinkFilterInput, GqlTicketClaimLinkSortInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class TicketClaimLinkConverter {
  filter(filter: GqlTicketClaimLinkFilterInput): Prisma.TicketClaimLinkWhereInput {
    return {
      AND: [
        filter?.status ? { status: filter.status } : {},
        filter?.issuerId ? { issuerId: filter.issuerId } : {},
      ],
    };
  }

  sort(sort: GqlTicketClaimLinkSortInput): Prisma.TicketClaimLinkOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? "desc",
      status: sort?.status,
    };
  }
}
