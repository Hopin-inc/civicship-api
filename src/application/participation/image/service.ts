import { GqlImageInput } from "@/types/graphql";
import { ValidationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import ParticipationImageConverter from "@/application/participation/image/data/converter";
import ParticipationImageRepository from "@/application/participation/image/data/repository";

export default class ParticipationImageService {
  static async validateAndCreateImages(
    ctx: IContext,
    images: GqlImageInput[] | undefined,
    participationId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    if (!images?.length) {
      throw new ValidationError(
        "At least one image is required for a personal participation record.",
        ["input.images"],
      );
    }

    const data = ParticipationImageConverter.createMany(images, participationId);
    await ParticipationImageRepository.createMany(ctx, data, tx);
  }
}
