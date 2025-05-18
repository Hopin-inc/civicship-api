import { GqlMembershipFilterInput, GqlMembershipSortInput } from "@/types/graphql";

import { 
  GqlMembershipStatus as MembershipStatus, 
  GqlRole as Role, 
  GqlMembershipStatusReason as MembershipStatusReason 
} from "@/types/graphql";
import { injectable } from "tsyringe";

@injectable()
export default class MembershipConverter {
  filter(filter?: GqlMembershipFilterInput): any {
    return {
      AND: [
        filter?.userId ? { userId: filter.userId } : {},
        filter?.communityId ? { communityId: filter.communityId } : {},
        filter?.status ? { status: filter.status } : {},
        filter?.role ? { role: filter.role } : {},
      ],
    };
  }

  sort(sort?: GqlMembershipSortInput): any[] {
    return [{ createdAt: sort?.createdAt ?? 'desc' }];
  }

  join(
    currentUserId: string,
    communityId: string,
    joinedUserId?: string,
  ): any {
    return {
      user: { connect: { id: joinedUserId ?? currentUserId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.Joined,
      reason: MembershipStatusReason.AcceptedInvitation,
      histories: {
        create: {
          status: MembershipStatus.Joined,
          reason: MembershipStatusReason.AcceptedInvitation,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  invite(
    invitedUserId: string,
    communityId: string,
    currentUserId: string,
    role?: Role,
  ): any {
    return {
      user: { connect: { id: invitedUserId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.Pending,
      reason: MembershipStatusReason.Invited,
      role: role ?? Role.Member,
      histories: {
        create: {
          status: MembershipStatus.Pending,
          reason: MembershipStatusReason.Invited,
          role: role ?? Role.Member,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  update(
    status: MembershipStatus,
    reason: MembershipStatusReason,
    role: Role,
    currentUserId: string,
  ): any {
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
