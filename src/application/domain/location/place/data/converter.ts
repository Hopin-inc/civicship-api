import {
  GqlPlaceCreateInput,
  GqlPlaceFilterInput,
  GqlPlaceSortInput,
  GqlPlaceUpdateInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class PlaceConverter {
  filter(filter?: GqlPlaceFilterInput): Prisma.PlaceWhereInput {
    return {
      AND: [
        filter?.keyword ? { name: { contains: filter.keyword } } : {},
        filter?.keyword ? { address: { contains: filter.keyword } } : {},
        filter?.cityCode ? { cityCode: filter.cityCode } : {},
      ],
    };
  }

  sort(sort?: GqlPlaceSortInput): Prisma.PlaceOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  create(input: GqlPlaceCreateInput): Prisma.PlaceCreateInput {
    const { cityCode, opportunityIds, communityId, ...prop } = input;
    return {
      ...prop,
      city: { connect: { code: cityCode } },
      opportunities: { connect: opportunityIds?.map((id) => ({ id })) },
      community: { connect: { id: communityId } },
    };
  }

  update(input: GqlPlaceUpdateInput): Prisma.PlaceUpdateInput {
    const { cityCode, opportunityIds, ...prop } = input;

    return {
      ...prop,
      city: { connect: { code: cityCode } },
      opportunities: { connect: opportunityIds?.map((id) => ({ id })) },
    };
  }
}
