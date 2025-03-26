import { GqlTicketFilterInput, GqlTicketSortInput } from "@/types/graphql";
import { Prisma, TicketStatus, TicketStatusReason } from "@prisma/client";

export default class TicketConverter {
  static filter(filter: GqlTicketFilterInput): Prisma.TicketWhereInput {
    return {
      AND: [
        filter?.walletId ? { walletId: filter.walletId } : {},
        filter?.utilityId ? { utilityId: filter.utilityId } : {},
        filter?.status ? { status: filter.status } : {},
      ],
    };
  }

  static sort(sort: GqlTicketSortInput): Prisma.TicketOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
      status: sort?.status,
    };
  }

  static purchase(
    currentUserId: string,
    walletId: string,
    utilityId: string,
    transactionId: string,
    participationId?: string,
  ): Prisma.TicketCreateInput {
    return {
      status: TicketStatus.AVAILABLE,
      reason: TicketStatusReason.PURCHASED,
      wallet: { connect: { id: walletId } },
      utility: { connect: { id: utilityId } },
      ticketStatusHistories: {
        create: {
          status: TicketStatus.AVAILABLE,
          reason: TicketStatusReason.PURCHASED,
          participation: { connect: { id: participationId } },
          createdByUser: { connect: { id: currentUserId } },
          transaction: { connect: { id: transactionId } },
        },
      },
    };
  }

  static reserve(currentUserId: string): Prisma.TicketUpdateInput {
    return {
      status: TicketStatus.DISABLED,
      reason: TicketStatusReason.RESERVED,
      ticketStatusHistories: {
        create: {
          status: TicketStatus.DISABLED,
          reason: TicketStatusReason.RESERVED,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static reserveInline(base: Prisma.TicketCreateInput, userId: string): Prisma.TicketCreateInput {
    return {
      ...base,
      status: TicketStatus.DISABLED,
      reason: TicketStatusReason.RESERVED,
      ticketStatusHistories: {
        create: {
          status: TicketStatus.DISABLED,
          reason: TicketStatusReason.RESERVED,
          createdByUser: { connect: { id: userId } },
        },
      },
    };
  }

  static cancelReserved(currentUserId: string): Prisma.TicketUpdateInput {
    return {
      status: TicketStatus.AVAILABLE,
      reason: TicketStatusReason.CANCELED,
      ticketStatusHistories: {
        create: {
          status: TicketStatus.AVAILABLE,
          reason: TicketStatusReason.CANCELED,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static use(currentUserId: string): Prisma.TicketUpdateInput {
    return {
      status: TicketStatus.DISABLED,
      reason: TicketStatusReason.USED,
      ticketStatusHistories: {
        create: {
          status: TicketStatus.DISABLED,
          reason: TicketStatusReason.USED,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static refund(currentUserId: string, transactionId: string): Prisma.TicketUpdateInput {
    return {
      status: TicketStatus.DISABLED,
      reason: TicketStatusReason.REFUNDED,
      ticketStatusHistories: {
        create: {
          status: TicketStatus.DISABLED,
          reason: TicketStatusReason.REFUNDED,
          createdByUser: { connect: { id: currentUserId } },
          transaction: { connect: { id: transactionId } },
        },
      },
    };
  }
}
