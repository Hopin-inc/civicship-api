import { GqlImageInput, GqlMutationUserSignUpArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IdentityConverter {
  static create({ input }: GqlMutationUserSignUpArgs): {
    data: Prisma.UserCreateInput;
    image?: GqlImageInput;
  } {
    const { image, slug, name, currentPrefecture } = input;

    return {
      data: {
        name,
        currentPrefecture,
        slug: slug || "",
      },
      image,
    };
  }
}
