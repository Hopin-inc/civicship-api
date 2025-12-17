import { GqlIdentityPlatform, GqlUserSignUpInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IdentityConverter {
  static create(
    input: GqlUserSignUpInput,
    uid: string,
    platform: GqlIdentityPlatform,
    communityId: string,
  ): Prisma.UserCreateInput {
    const { slug, name, currentPrefecture, phoneNumber, phoneUid, preferredLanguage } = input;

    const identities = phoneUid
      ? {
          create: [
            { uid, platform, communityId },
            { uid: phoneUid, platform: GqlIdentityPlatform.Phone },
          ],
        }
      : { create: { uid, platform, communityId } };

    return {
      name,
      currentPrefecture,
      slug: slug || "",
      phoneNumber,
      preferredLanguage,
      identities,
    };
  }
}
