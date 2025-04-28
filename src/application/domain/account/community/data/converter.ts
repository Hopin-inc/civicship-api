import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlCommunityFilterInput,
  GqlCommunitySortInput,
  GqlImageInput,
} from "@/types/graphql";
import { MembershipStatus, MembershipStatusReason, Prisma, Role } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class CommunityConverter {
  filter(filter?: GqlCommunityFilterInput): Prisma.CommunityWhereInput {
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

  sort(sort?: GqlCommunitySortInput): Prisma.CommunityOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  create(
    input: GqlCommunityCreateInput,
    currentUserId: string,
  ): {
    data: Prisma.CommunityCreateInput;
    image?: GqlImageInput;
  } {
    const { image, places, ...prop } = input;

    return {
      data: {
        ...prop,
        memberships: {
          create: [
            {
              userId: currentUserId,
              status: MembershipStatus.JOINED,
              reason: MembershipStatusReason.CREATED_COMMUNITY,
              role: Role.OWNER,
              histories: {
                create: {
                  status: MembershipStatus.JOINED,
                  reason: MembershipStatusReason.CREATED_COMMUNITY,
                  role: Role.OWNER,
                  createdByUser: { connect: { id: currentUserId } },
                },
              },
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
      },
      image,
    };
  }

  update(input: GqlCommunityUpdateProfileInput): {
    data: Prisma.CommunityUpdateInput;
    image?: GqlImageInput;
  } {
    const { image, places, ...prop } = input;
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
      data: {
        ...prop,
        places: {
          connect: existingPlaces,
          create: newPlaces,
          disconnect: disconnect?.map((id) => ({ id })),
        },
      },
      image,
    };
  }
}
