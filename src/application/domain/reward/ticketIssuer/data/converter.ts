import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import {
  GqlClaimLinkStatus,
  GqlTicketIssuerFilterInput,
  GqlTicketIssuerSortInput,
} from "@/types/graphql";

@injectable()
export default class TicketIssuerConverter {
  filter(filter?: GqlTicketIssuerFilterInput): Prisma.TicketIssuerWhereInput {
    const conditions: Prisma.TicketIssuerWhereInput[] = [];

    if (!filter) return {};

    if (filter.ownerId) {
      conditions.push({ ownerId: filter.ownerId });
    }

    return conditions.length ? { AND: conditions } : {};
  }

  sort(sort?: GqlTicketIssuerSortInput): Prisma.TicketIssuerOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  issue(userId: string, utilityId: string, qty: number): Prisma.TicketIssuerCreateInput {
    return {
      qtyToBeIssued: qty,
      utility: { connect: { id: utilityId } },
      owner: { connect: { id: userId } },
      claimLink: { create: { status: GqlClaimLinkStatus.Issued } },
    };
  }
}
