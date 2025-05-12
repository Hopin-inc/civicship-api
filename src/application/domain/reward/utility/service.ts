import { injectable, inject } from "tsyringe";
import {
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityCreateInput,
  GqlUtilityFilterInput,
  GqlQueryUtilitiesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { Prisma, PublishStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { IImageService } from "../../content/image/interface";
import UtilityConverter from "./data/converter";
import { IUtilityService, IUtilityRepository } from "./data/interface";

@injectable()
export default class UtilityService implements IUtilityService {
  constructor(
    @inject("UtilityRepository") private readonly repository: IUtilityRepository,
    @inject("UtilityConverter") private readonly converter: UtilityConverter,
    @inject("ImageService") private readonly imageService: IImageService,
  ) {}

  async fetchUtilities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUtilitiesArgs,
    take: number,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return await this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findUtility(ctx: IContext, id: string, filter: GqlUtilityFilterInput) {
    const where = this.converter.findAccessible(id, filter ?? {});
    const utility = await this.repository.findAccessible(ctx, where);
    if (!utility) {
      return null;
    }
    return utility;
  }

  async findUtilityOrThrow(ctx: IContext, id: string) {
    const utility = await this.repository.find(ctx, id);
    if (!utility) {
      throw new NotFoundError("Utility", { id });
    }
    return utility;
  }

  async createUtility(ctx: IContext, input: GqlUtilityCreateInput, tx: Prisma.TransactionClient) {
    const { data, images } = this.converter.create(input);

    const uploadedImages: Prisma.ImageCreateWithoutUtilitiesInput[] = await Promise.all(
      images.map((img) => this.imageService.uploadPublicImage(img, "utilities")),
    );

    const createInput: Prisma.UtilityCreateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return await this.repository.create(ctx, createInput, tx);
  }

  async deleteUtility(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    await this.findUtilityOrThrow(ctx, id);
    return this.repository.delete(ctx, id, tx);
  }

  async updateUtilityInfo(
    ctx: IContext,
    { id, input }: GqlMutationUtilityUpdateInfoArgs,
    tx: Prisma.TransactionClient,
  ) {
    await this.findUtilityOrThrow(ctx, id);

    const { data, images } = this.converter.updateInfo(input);

    const uploadedImages: Prisma.ImageCreateWithoutUtilitiesInput[] = await Promise.all(
      images.map((img) => this.imageService.uploadPublicImage(img, "utilities")),
    );

    const updateInput: Prisma.UtilityUpdateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return await this.repository.update(ctx, id, updateInput, tx);
  }

  validatePublishStatus(allowedStatuses: PublishStatus[], filter?: GqlUtilityFilterInput) {
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
