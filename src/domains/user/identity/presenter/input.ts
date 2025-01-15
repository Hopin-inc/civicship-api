import { GqlMutationCreateUserArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IdentityInputFormat {
  static create({ input }: GqlMutationCreateUserArgs): Prisma.UserCreateInput {
    return {
      ...input,
      slug: input.slug || "",
      image: input.image?.base64,
    };
  }
}
