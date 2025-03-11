import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlCommunityFilterInput,
  GqlCommunitySortInput,
} from "@/types/graphql";
import { MembershipStatus, Prisma, Role } from "@prisma/client";

export default class CommunityConverter {
  static filter(filter?: GqlCommunityFilterInput): Prisma.CommunityWhereInput {
    return {
      AND: [
        filter?.keyword
          ? {
              OR: [
                { name: { contains: filter.keyword } },
                { pointName: { contains: filter.keyword } },
                { bio: { contains: filter.keyword } },
              ],
            }
          : {},
        filter?.placeIds && filter.placeIds.length
          ? { places: { some: { id: { in: filter.placeIds } } } }
          : {},
        filter?.cityCodes && filter.cityCodes.length
          ? { places: { some: { cityCode: { in: filter.cityCodes } } } }
          : {},
      ],
    };
  }

  static sort(sort?: GqlCommunitySortInput): Prisma.CommunityOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static create(
    input: GqlCommunityCreateInput,
    currentUserId: string,
  ): Prisma.CommunityCreateInput {
    const { ...prop } = input;

    return {
      ...prop,
      image: input.image?.base64,
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
    const { ...prop } = input;

    return {
      ...prop,
      image: input.image?.base64,
    };
  }
}
