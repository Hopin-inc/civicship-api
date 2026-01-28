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

    // For LINE platform, create a global identity (communityId=null) for the integrated LINE channel
    // This allows the user to be found regardless of which community they're accessing
    const lineIdentityCommunityId = platform === GqlIdentityPlatform.Line ? null : communityId;

    const identities = phoneUid
      ? {
          create: [
            { uid, platform, communityId: lineIdentityCommunityId },
            { uid: phoneUid, platform: GqlIdentityPlatform.Phone },
          ],
        }
      : { create: { uid, platform, communityId: lineIdentityCommunityId } };

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
