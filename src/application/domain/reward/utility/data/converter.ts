import {
  GqlUtilityFilterInput,
  GqlUtilitySortInput,
  GqlUtilityCreateInput,
  GqlUtilityUpdateInfoInput,
  GqlImageInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class UtilityConverter {
  static filter(filter?: GqlUtilityFilterInput): Prisma.UtilityWhereInput {
    if (!filter) return {};

    const conditions: Prisma.UtilityWhereInput[] = [];
    if (filter.communityId) conditions.push({ communityId: filter.communityId });
    if (filter.publishStatus?.length)
      conditions.push({ publishStatus: { in: filter.publishStatus } });

    if (filter.and?.length) conditions.push({ AND: filter.and.map(this.filter) });
    if (filter.or?.length) conditions.push({ OR: filter.or.map(this.filter) });
    if (filter.not) conditions.push({ NOT: this.filter(filter.not) });

    return conditions.length ? { AND: conditions } : {};
  }

  static sort(sort: GqlUtilitySortInput): Prisma.UtilityOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
      pointsRequired: sort?.pointsRequired,
    };
  }

  static findAccessible(
    id: string,
    filter?: GqlUtilityFilterInput,
  ): Prisma.UtilityWhereUniqueInput & Prisma.UtilityWhereInput {
    const safeFilter = this.filter(filter);
    return {
      id,
      ...(safeFilter.AND ? { AND: safeFilter.AND } : {}),
    };
  }

  static create(input: GqlUtilityCreateInput): {
    data: Omit<Prisma.UtilityCreateInput, "images">;
    images: GqlImageInput[];
  } {
    const { images, communityId, ...prop } = input;
    return {
      data: {
        ...prop,
        community: { connect: { id: communityId } },
      },
      images: images ?? [],
    };
  }

  static updateInfo(input: GqlUtilityUpdateInfoInput): {
    data: Omit<Prisma.UtilityUpdateInput, "images">;
    images: GqlImageInput[];
  } {
    const { images, ...prop } = input;

    return {
      data: {
        ...prop,
      },
      images: images ?? [],
    };
  }
}
