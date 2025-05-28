import { GqlImageInput, GqlMutationUserSignUpArgs } from "@/types/graphql";

export default class IdentityConverter {
  static create({ input }: GqlMutationUserSignUpArgs): {
    data: {
      name: string;
      currentPrefecture: string;
      slug: string;
      phoneNumber?: string;
    };
    image?: GqlImageInput;
    phoneUid?: string;
  } {
    const { image, slug, name, currentPrefecture, phoneUid, phoneNumber } = input;

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
