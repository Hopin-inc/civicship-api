import { GqlImageInput, GqlMutationUserSignUpArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IdentityConverter {
  static create({ input }: GqlMutationUserSignUpArgs): {
    data: Prisma.UserCreateInput;
    image?: GqlImageInput;
    phoneUid?: string;
  } {
    const { image, slug, name, currentPrefecture, phoneUid } = input;

    return {
      data: {
        name,
        currentPrefecture,
        slug: slug || "",
      },
      image,
      phoneUid,
    };
  }
}
