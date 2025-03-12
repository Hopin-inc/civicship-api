import {
  GqlUtilityFilterInput,
  GqlUtilitySortInput,
  GqlUtilityCreateInput,
  GqlUtilityUpdateInfoInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class UtilityConverter {
  static filter(filter: GqlUtilityFilterInput): Prisma.UtilityWhereInput {
    return {
      AND: [filter?.communityId ? { communityId: filter.communityId } : {}],
    };
  }

  static sort(sort: GqlUtilitySortInput): Prisma.UtilityOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
      pointsRequired: sort?.pointsRequired,
    };
  }

  static create(input: GqlUtilityCreateInput): Prisma.UtilityCreateInput {
    return {
      ...input,
      image: input.image?.base64,
      community: { connect: { id: input.communityId } },
    };
  }

  static updateInfo(input: GqlUtilityUpdateInfoInput): Prisma.UtilityUpdateInput {
    return {
      ...input,
      image: input.image?.base64,
    };
  }
}
