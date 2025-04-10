import {
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityCreateInput,
  GqlUtility,
  GqlUtilityFilterInput,
  GqlQueryUtilitiesArgs,
} from "@/types/graphql";
import UtilityRepository from "@/application/domain/utility/data/repository";
import { IContext } from "@/types/server";
import UtilityConverter from "@/application/domain/utility/data/converter";
import { Prisma, PublishStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import ImageService from "@/application/domain/image/service";

export default class UtilityService {
  static async fetchUtilities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUtilitiesArgs,
    take: number,
  ) {
    const where = UtilityConverter.filter(filter ?? {});
    const orderBy = UtilityConverter.sort(sort ?? {});

    return await UtilityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findUtility(ctx: IContext, id: string, filter: GqlUtilityFilterInput) {
    const where = UtilityConverter.findAccessible(id, filter ?? {});
    const utility = await UtilityRepository.findAccessible(ctx, where);
    if (!utility) {
      return null;
    }
    return utility;
  }

  static async findUtilityOrThrow(ctx: IContext, id: string): Promise<GqlUtility> {
    const utility = await UtilityRepository.find(ctx, id);
    if (!utility) {
      throw new NotFoundError("Utility", { id });
    }
    return utility;
  }

  static async createUtility(ctx: IContext, input: GqlUtilityCreateInput) {
    const { data, images } = UtilityConverter.create(input);

    const uploadedImages: Prisma.ImageCreateWithoutUtilitiesInput[] = await Promise.all(
      images.map((img) => ImageService.uploadPublicImage(img, "utilities")),
    );

    const createInput: Prisma.UtilityCreateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return await UtilityRepository.create(ctx, createInput);
  }

  static async deleteUtility(ctx: IContext, id: string) {
    await this.findUtilityOrThrow(ctx, id);
    return UtilityRepository.delete(ctx, id);
  }

  static async updateUtilityInfo(ctx: IContext, { id, input }: GqlMutationUtilityUpdateInfoArgs) {
    await this.findUtilityOrThrow(ctx, id);

    const { data, images } = UtilityConverter.updateInfo(input);

    const uploadedImages: Prisma.ImageCreateWithoutUtilitiesInput[] = await Promise.all(
      images.map((img) => ImageService.uploadPublicImage(img, "utilities")),
    );

    const updateInput: Prisma.UtilityUpdateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return await UtilityRepository.update(ctx, id, updateInput);
  }

  static async validatePublishStatus(
    allowedStatuses: PublishStatus[],
    filter?: GqlUtilityFilterInput,
  ) {
    if (
      filter?.publishStatus &&
      !filter.publishStatus.every((publishStatus) => allowedStatuses.includes(publishStatus))
    ) {
      throw new ValidationError(
        `Validation error: publishStatus must be one of ${allowedStatuses.join(", ")}`,
        [JSON.stringify(filter?.publishStatus)],
      );
    }
  }
}
