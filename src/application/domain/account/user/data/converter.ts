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
