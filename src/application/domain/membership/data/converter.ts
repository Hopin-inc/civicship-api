import { GqlMembershipFilterInput, GqlMembershipSortInput } from "@/types/graphql";
import { Prisma, MembershipStatus, Role, MembershipStatusReason } from "@prisma/client";

export default class MembershipConverter {
  static filter(filter?: GqlMembershipFilterInput): Prisma.MembershipWhereInput {
    return {
      AND: [
        filter?.userId ? { userId: filter.userId } : {},
        filter?.communityId ? { communityId: filter.communityId } : {},
        filter?.status ? { status: filter.status } : {},
        filter?.role ? { role: filter.role } : {},
      ],
    };
  }

  static sort(sort?: GqlMembershipSortInput): Prisma.MembershipOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static join(
    currentUserId: string,
    communityId: string,
    joinedUserId?: string,
  ): Prisma.MembershipCreateInput {
    return {
      user: { connect: { id: joinedUserId ?? currentUserId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.ACCEPTED_INVITATION,
      histories: {
        create: {
          status: MembershipStatus.JOINED,
          reason: MembershipStatusReason.ACCEPTED_INVITATION,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static invite(
    invitedUserId: string,
    communityId: string,
    currentUserId: string,
    role?: Role,
  ): Prisma.MembershipCreateInput {
    return {
      user: { connect: { id: invitedUserId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.PENDING,
      reason: MembershipStatusReason.INVITED,
      role: role ?? Role.MEMBER,
      histories: {
        create: {
          status: MembershipStatus.PENDING,
          reason: MembershipStatusReason.INVITED,
          role: role ?? Role.MEMBER,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static update(
    status: MembershipStatus,
    reason: MembershipStatusReason,
    role: Role,
    currentUserId: string,
  ): Prisma.MembershipUpdateInput {
    return {
      status,
      reason,
      role,
      histories: {
        create: {
          status,
          reason,
          role,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }
}
