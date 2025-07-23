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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { originalId, image, config, createdBy, ...prop } = input;

    return {
      data: {
        ...prop,
        id: originalId,
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
        ...(config && {
          config: {
            create: {
              ...(config.firebaseConfig && {
                firebaseConfig: {
                  create: {
                    tenantId: config.firebaseConfig.tenantId,
                  },
                },
              }),
              ...(config.lineConfig && {
                lineConfig: {
                  create: {
                    channelId: config.lineConfig.channelId,
                    channelSecret: config.lineConfig.channelSecret,
                    accessToken: config.lineConfig.accessToken,
                    liffId: config.lineConfig.liffId,
                    liffBaseUrl: config.lineConfig.liffBaseUrl,
                    richMenus: {
                      create: config.lineConfig.richMenus.map((menu) => ({
                        type: menu.type,
                        richMenuId: menu.richMenuId,
                      })),
                    },
                  },
                },
              }),
            },
          },
        }),
      },
      image,
    };
  }

  update(input: GqlCommunityUpdateProfileInput): {
    data: Prisma.CommunityUpdateInput;
    image?: GqlImageInput;
  } {
    const { image, ...prop } = input;

    return {
      data: {
        ...prop,
      },
      image,
    };
  }
}
