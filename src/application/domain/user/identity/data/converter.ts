import { GqlImageInput, GqlMutationUserSignUpArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IdentityConverter {
  static create({ input }: GqlMutationUserSignUpArgs): {
    data: Prisma.UserCreateInput;
    image?: GqlImageInput;
  } {
    const { image, slug, ...prop } = input;

    return {
      data: {
        ...prop,
        slug: slug || "",
      },
      image,
    };
  }
}
