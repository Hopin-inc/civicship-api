import {
  GqlImageInput,
  GqlUserFilterInput,
  GqlUserSortInput,
  GqlUserUpdateProfileInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class UserConverter {
  filter(filter: GqlUserFilterInput): Prisma.UserWhereInput {
    const keywordConditions = filter?.keywords && filter.keywords.length > 0
      ? {
        OR: filter.keywords.flatMap(keyword => [
          { name: { contains: keyword } },
          { slug: { contains: keyword } }
        ])
      }
      : {};

    return {
      AND: [
        filter?.sysRole ? { sysRole: filter.sysRole } : {},
        keywordConditions,
        filter?.ids && filter.ids.length > 0 ? { id: { in: filter.ids } } : {},
      ],
    };
  }

  sort(sort: GqlUserSortInput): Prisma.UserOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
    };
  }

  update(input: GqlUserUpdateProfileInput): {
    data: Prisma.UserUpdateInput;
    image?: GqlImageInput;
  } {
    const { image, ...data } = input;
    return { image, data };
  }
}
