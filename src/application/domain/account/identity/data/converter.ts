import { GqlImageInput, GqlMutationUserSignUpArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IdentityConverter {
  static create({ input }: GqlMutationUserSignUpArgs, phoneNumber?: string): {
    data: any; // Using any instead of Prisma.UserCreateInput due to type issues
    image?: GqlImageInput;
    phoneUid?: string;
  } {
    const { image, slug, name, currentPrefecture, phoneUid } = input;

    return {
      data: {
        name,
        currentPrefecture,
        slug: slug || "",
        phoneNumber,
      },
      image,
      phoneUid,
    };
  }
}
