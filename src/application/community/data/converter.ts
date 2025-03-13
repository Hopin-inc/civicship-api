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
    const { places, ...prop } = input;

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
      places: {
        create: places?.map((place) => ({
          ...place,
          city: {
            connect: { id: place.cityCode },
          },
        })),
      },
    };
  }

  static update(input: GqlCommunityUpdateProfileInput): Prisma.CommunityUpdateInput {
    const { places, ...prop } = input;
    const { connectOrCreate, disconnect } = places;

    const existingPlaces = connectOrCreate
      ?.filter((item) => item.where && !item.create)
      .map((item) => ({ id: item.where }));

    const newPlaces = connectOrCreate
      ?.filter((item) => item.create && !item.where)
      .map((item) => {
        const { cityCode, ...restCreate } = item.create!;
        return {
          ...restCreate,
          city: { connect: { code: cityCode } },
        };
      });

    return {
      ...prop,
      image: input.image?.base64,
      places: {
        connect: existingPlaces,
        create: newPlaces,
        disconnect: disconnect?.map((id) => ({ id })),
      },
    };
  }
}
