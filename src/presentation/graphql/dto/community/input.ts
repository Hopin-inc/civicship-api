import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlCommunityFilterInput,
  GqlCommunitySortInput,
} from "@/types/graphql";
import { MembershipStatus, Prisma, Role } from "@prisma/client";

export default class CommunityInputFormat {
  static filter(filter?: GqlCommunityFilterInput): Prisma.CommunityWhereInput {
    return {
      // AND: [
      // filter?.stateCode ? { stateCode: filter.stateCode } : {},
      // filter?.cityCode ? { cityCode: filter.cityCode } : {},
      // ],
    };
  }

  static sort(sort?: GqlCommunitySortInput): Prisma.CommunityOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static create(
    input: GqlCommunityCreateInput,
    currentUserId: string,
  ): Prisma.CommunityCreateInput {
    const { ...properties } = input;

    return {
      ...properties,
      memberships: {
        create: [
          {
            userId: currentUserId,
            status: MembershipStatus.JOINED,
            role: Role.OWNER,
          },
        ],
      },
    };
  }

  static update(input: GqlCommunityUpdateProfileInput): Prisma.CommunityUpdateInput {
    const { ...properties } = input;

    return {
      ...properties,
      // city: cityCode ? { connect: { code: cityCode } } : undefined,
    };
  }
}
