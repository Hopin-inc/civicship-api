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
    if (filter.communityId) conditions.push({ communityId: filter.communityId });
    if (filter.publishStatus?.length)
      conditions.push({ publishStatus: { in: filter.publishStatus } });
    if (filter.createdBy) conditions.push({ createdBy: filter.createdBy });

    if (filter.and?.length) conditions.push({ AND: filter.and.map(f => this.filter(f)) });
    if (filter.or?.length) conditions.push({ OR: filter.or.map(f => this.filter(f)) });
    if (filter.not) conditions.push({ NOT: this.filter(filter.not) });

    return conditions.length ? { AND: conditions } : {};
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

  create(input: GqlUtilityCreateInput, createdBy: string): {
    data: Omit<Prisma.UtilityCreateInput, "images">;
    images: GqlImageInput[];
  } {
    const { images, communityId, requiredForOpportunityIds, ...prop } = input;
    return {
      data: {
        ...prop,
        community: { connect: { id: communityId } },
        createdByUser: { connect: { id: createdBy } },
        ...(requiredForOpportunityIds?.length && {
          requiredForOpportunities: {
            connect: requiredForOpportunityIds.map(id => ({ id }))
          }
        })
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
