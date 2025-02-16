import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IdentityInputFormat {
  static create({ input }: GqlMutationUserSignUpArgs): Prisma.UserCreateInput {
    return {
      ...input,
      slug: input.slug || "",
      image: input.image?.base64,
    };
  }
}
