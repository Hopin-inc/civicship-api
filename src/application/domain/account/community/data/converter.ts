import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlCommunityFilterInput,
  GqlCommunitySortInput,
  GqlImageInput,
} from "@/types/graphql";

const DEFAULT_ENABLE_FEATURES = ["points", "justDaoIt", "languageSwitcher"];
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
    tenantId: string,
  ): {
    data: Prisma.CommunityCreateInput;
    image?: GqlImageInput;
  } {
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
        config: {
          create: {
            firebaseConfig: {
              create: { tenantId },
            },
            ...(config?.lineConfig && {
              lineConfig: {
                create: {
                  channelId: config.lineConfig.channelId,
                  channelSecret: config.lineConfig.channelSecret,
                  accessToken: config.lineConfig.accessToken,
                  liffId: config.lineConfig.liffId,
                  liffAppId: config.lineConfig.liffAppId ?? null,
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
            portalConfig: {
              create: {
                tokenName:        config?.portalConfig?.tokenName      ?? prop.pointName,
                title:            config?.portalConfig?.title          ?? prop.name,
                description:      config?.portalConfig?.description    ?? "",
                shortDescription: config?.portalConfig?.shortDescription ?? null,
                domain:           config?.portalConfig?.domain         ?? "",
                faviconPrefix:    config?.portalConfig?.faviconPrefix  ?? "",
                logoPath:         config?.portalConfig?.logoPath       ?? "",
                squareLogoPath:   config?.portalConfig?.squareLogoPath ?? "",
                ogImagePath:      config?.portalConfig?.ogImagePath    ?? "",
                enableFeatures:   config?.portalConfig?.enableFeatures ?? DEFAULT_ENABLE_FEATURES,
                rootPath:         config?.portalConfig?.rootPath       ?? "/",
                adminRootPath:    config?.portalConfig?.adminRootPath  ?? "/admin",
                regionName:       config?.portalConfig?.regionName     ?? null,
                regionKey:        config?.portalConfig?.regionKey      ?? null,
              },
            },
          },
        },
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
