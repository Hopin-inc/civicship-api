import {
  GqlUtilityFilterInput,
  GqlUtilitySortInput,
  GqlUtilityCreateInput,
  GqlUtilityUpdateInfoInput,
  GqlImageInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class UtilityConverter {
  filter(filter?: GqlUtilityFilterInput): Prisma.UtilityWhereInput {
    if (!filter) return {};
    const conditions: Prisma.UtilityWhereInput[] = [];

    if (filter.communityIds && Array.isArray(filter.communityIds) && filter.communityIds.length > 0) {
      conditions.push({ communityId: { in: filter.communityIds } });
    }
    if (filter.ownerIds && Array.isArray(filter.ownerIds) && filter.ownerIds.length > 0) {
      conditions.push({ ownerId: { in: filter.ownerIds } });
    }
    if (filter.publishStatus && Array.isArray(filter.publishStatus) && filter.publishStatus.length > 0) {
      conditions.push({ publishStatus: { in: filter.publishStatus } });
    }

    if (filter.and && Array.isArray(filter.and) && filter.and.length > 0) {
      conditions.push({ AND: filter.and.map((f) => this.filter(f)).filter(Boolean) });
    }
    if (filter.or && Array.isArray(filter.or) && filter.or.length > 0) {
      conditions.push({ OR: filter.or.map((f) => this.filter(f)).filter(Boolean) });
    }
    if (filter.not) {
      const notFilter = this.filter(filter.not);
      if (Object.keys(notFilter).length > 0) {
        conditions.push({ NOT: notFilter });
      }
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  sort(sort: GqlUtilitySortInput): Prisma.UtilityOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
      pointsRequired: sort?.pointsRequired,
    };
  }

  findAccessible(
    id: string,
    filter?: GqlUtilityFilterInput,
  ): Prisma.UtilityWhereUniqueInput & Prisma.UtilityWhereInput {
    const safeFilter = this.filter(filter);
    return {
      id,
      ...(safeFilter.AND ? { AND: safeFilter.AND } : {}),
    };
  }

  create(
    input: GqlUtilityCreateInput,
    currentUserId: string,
    communityId: string,
  ): {
    data: Omit<Prisma.UtilityCreateInput, "images">;
    images: GqlImageInput[];
  } {
    const { images, requiredForOpportunityIds, ...prop } = input;
    return {
      data: {
        ...prop,
        community: { connect: { id: communityId } },
        owner: { connect: { id: currentUserId } },
        requiredForOpportunities: requiredForOpportunityIds
          ? { connect: requiredForOpportunityIds.map(id => ({ id })) }
          : undefined,
      },
      images: images ?? [],
    };
  }

  updateInfo(input: GqlUtilityUpdateInfoInput): {
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
