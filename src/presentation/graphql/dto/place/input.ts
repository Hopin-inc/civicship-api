import {
  GqlPlaceCreateInput,
  GqlPlaceFilterInput,
  GqlPlaceSortInput,
  GqlPlaceUpdateInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class PlaceInputFormat {
  static filter(filter?: GqlPlaceFilterInput): Prisma.PlaceWhereInput {
    return {
      AND: [
        filter?.keyword ? { name: { contains: filter.keyword } } : {},
        filter?.keyword ? { address: { contains: filter.keyword } } : {},
        filter?.cityCode ? { cityCode: filter.cityCode } : {},
      ],
    };
  }

  static sort(sort?: GqlPlaceSortInput): Prisma.PlaceOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static create(input: GqlPlaceCreateInput): Prisma.PlaceCreateInput {
    const { cityCode, ...properties } = input;
    return {
      ...properties,
      city: { connect: { code: cityCode } },
    };
  }

  static update(input: GqlPlaceUpdateInput): Prisma.PlaceUpdateInput {
    const { cityCode, ...properties } = input;
    return {
      ...properties,
      city: cityCode ? { connect: { code: cityCode } } : undefined,
    };
  }
}
