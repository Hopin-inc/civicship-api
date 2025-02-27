import { GqlUserFilterInput, GqlUserSortInput, GqlUserUpdateProfileInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class UserInputFormat {
  static filter(filter: GqlUserFilterInput): Prisma.UserWhereInput {
    return {
      AND: [
        filter?.sysRole ? { sysRole: filter?.sysRole } : {},
        filter.articleAuthorId
          ? {
              articlesWrittenByMe: {
                some: { id: filter.articleAuthorId },
              },
            }
          : {},
        filter.articleWriterId
          ? {
              articlesAboutMe: {
                some: { id: filter.articleWriterId },
              },
            }
          : {},
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

  static update(input: GqlUserUpdateProfileInput): Prisma.UserUpdateInput {
    return {
      ...input,
      image: input.image?.base64,
    };
  }
}
