import {
  GqlTicketStatusHistoryFilterInput,
  GqlTicketStatusHistorySortInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class TicketStatusHistoryConverter {
  static filter(filter: GqlTicketStatusHistoryFilterInput): Prisma.TicketStatusHistoryWhereInput {
    return {
      AND: [
        filter?.ticketId ? { ticketId: filter.ticketId } : {},
        filter?.status ? { status: filter.status } : {},
        filter?.reason ? { reason: filter.reason } : {},
        filter?.createdById ? { createdBy: filter.createdById } : {},
      ],
    };
  }

  static sort(
    sort: GqlTicketStatusHistorySortInput,
  ): Prisma.TicketStatusHistoryOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
    };
  }
}
