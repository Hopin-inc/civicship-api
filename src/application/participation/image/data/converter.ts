import { GqlImageInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ParticipationImageConverter {
  static createMany(
    images: GqlImageInput[],
    participationId: string,
  ): Prisma.ParticipationImageCreateManyInput[] {
    return images.map((image) => ({
      participationId,
      url: image.base64,
      caption: image.caption ?? null,
    }));
  }
}
