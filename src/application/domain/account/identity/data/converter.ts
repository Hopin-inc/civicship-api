import { GqlImageInput, GqlMutationUserSignUpArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IdentityConverter {
  static create({ input }: GqlMutationUserSignUpArgs): {
    data: Prisma.UserCreateInput;
    image?: GqlImageInput;
    phoneUid?: string;
    lineRefreshToken?: string;
    phoneRefreshToken?: string;
  } {
    const {
      image,
      slug,
      name,
      currentPrefecture,
      phoneUid,
      phoneNumber,
      lineRefreshToken,
      phoneRefreshToken
    } = input;

    return {
      data: {
        name,
        currentPrefecture,
        slug: slug || "",
        phoneNumber,
      },
      image,
      phoneUid,
      lineRefreshToken,
      phoneRefreshToken,
    };
  }
}
