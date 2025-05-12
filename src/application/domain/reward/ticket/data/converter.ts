import { GqlTicketFilterInput, GqlTicketSortInput } from "@/types/graphql";
import { Prisma, TicketStatus, TicketStatusReason } from "@prisma/client";
import { PrismaTicketClaimLink } from "@/application/domain/reward/ticketClaimLink/data/type";
import { injectable } from "tsyringe";

@injectable()
export default class TicketConverter {
  filter(filter: GqlTicketFilterInput): Prisma.TicketWhereInput {
    return {
      AND: [
        filter?.walletId ? { walletId: filter.walletId } : {},
        filter?.utilityId ? { utilityId: filter.utilityId } : {},
        filter?.status ? { status: filter.status } : {},
      ],
    };
  }

  sort(sort: GqlTicketSortInput): Prisma.TicketOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
      status: sort?.status,
    };
  }

  claim(
    currentUserId: string,
    claimLinkId: string,
    issuedTicket: PrismaTicketClaimLink["issuer"],
    walletId: string,
  ): Prisma.TicketCreateInput {
    const { utilityId } = issuedTicket;

    return {
      status: TicketStatus.AVAILABLE,
      reason: TicketStatusReason.GIFTED,
      wallet: { connect: { id: walletId } },
      utility: { connect: { id: utilityId } },
      claimLink: { connect: { id: claimLinkId } },
      ticketStatusHistories: {
        create: {
          status: TicketStatus.AVAILABLE,
          reason: TicketStatusReason.GIFTED,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  purchase(
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

  reserve(currentUserId: string, participationId?: string): Prisma.TicketUpdateInput {
    return {
      status: TicketStatus.DISABLED,
      reason: TicketStatusReason.RESERVED,
      ticketStatusHistories: {
        create: {
          status: TicketStatus.DISABLED,
          reason: TicketStatusReason.RESERVED,
          ...(participationId && { participation: { connect: { id: participationId } } }),
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  cancelReserved(currentUserId: string): Prisma.TicketUpdateInput {
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

  use(currentUserId: string): Prisma.TicketUpdateInput {
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

  refund(currentUserId: string, transactionId: string): Prisma.TicketUpdateInput {
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
