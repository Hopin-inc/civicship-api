import { GqlImageInput, GqlUserFilterInput, GqlUserSortInput, GqlUserUpdateProfileInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class UserConverter {
  static filter(filter: GqlUserFilterInput): Prisma.UserWhereInput {
    return {
      AND: [
        filter?.sysRole ? { sysRole: filter?.sysRole } : {},
        filter.keyword
          ? {
              OR: [{ name: { contains: filter.keyword } }, { slug: { contains: filter.keyword } }],
            }
          : {},
      ],
    };
  }

  static sort(sort: GqlUserSortInput): Prisma.UserOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
    };
  }

  static update(input: GqlUserUpdateProfileInput): {
    data: Prisma.UserUpdateInput,
    image?: GqlImageInput,
  } {
    const { image, ...data } = input;
    return { image, data };
  }
}
