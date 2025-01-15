import { GqlUserFilterInput, GqlUserSortInput, GqlUserUpdateProfileInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class UserInputFormat {
  static filter(filter: GqlUserFilterInput): Prisma.UserWhereInput {
    return {
      AND: [filter?.sysRole ? { sysRole: filter?.sysRole } : {}],
    };
  }

  static sort(sort: GqlUserSortInput): Prisma.UserOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
    };
  }

  static update(input: GqlUserUpdateProfileInput): Prisma.UserUpdateInput {
    return {
      name: input.name,
      slug: input.slug,
      bio: input.bio,
      image: input.image?.base64,
    };
  }
}
