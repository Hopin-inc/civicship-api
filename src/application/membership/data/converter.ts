import {
  GqlMembershipFilterInput,
  GqlMembershipSortInput,
  GqlMembershipInviteInput,
  GqlMembershipSetInvitationStatusInput,
} from "@/types/graphql";
import { Prisma, MembershipStatus, Role } from "@prisma/client";

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

  static join(input: GqlMembershipSetInvitationStatusInput): Prisma.MembershipCreateInput {
    return {
      user: { connect: { id: input.userId } },
      community: { connect: { id: input.communityId } },
      status: MembershipStatus.JOINED,
    };
  }

  static invite(input: GqlMembershipInviteInput): Prisma.MembershipCreateInput {
    return {
      user: { connect: { id: input.userId } },
      community: { connect: { id: input.communityId } },
      status: MembershipStatus.INVITED,
      role: input.role ?? Role.MEMBER,
    };
  }

  static setStatus(
    status: MembershipStatus,
  ): Prisma.EnumMembershipStatusFieldUpdateOperationsInput {
    return { set: status };
  }

  static setRole(role: Role): Prisma.EnumRoleFieldUpdateOperationsInput {
    return { set: role };
  }
}
