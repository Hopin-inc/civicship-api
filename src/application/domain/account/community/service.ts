import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlQueryCommunitiesArgs,
} from "@/types/graphql";
import CommunityConverter from "@/application/domain/account/community/data/converter";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { getCurrentUserId } from "@/application/domain/utils";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import ImageService from "@/application/domain/content/image/service";
import { ICommunityRepository } from "@/application/domain/account/community/data/interface";

export default class CommunityService {
  constructor(
    private readonly repository: ICommunityRepository,
    private readonly converter: CommunityConverter,
    private readonly imageService: ImageService,
  ) {}

  async fetchCommunities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryCommunitiesArgs,
    take: number,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return await this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findCommunity(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async findCommunityOrThrow(ctx: IContext, id: string) {
    const community = await this.repository.find(ctx, id);
    if (!community) {
      throw new NotFoundError("Community", { id });
    }
    return community;
  }

  async createCommunityAndJoinAsOwner(
    ctx: IContext,
    input: GqlCommunityCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const userId = getCurrentUserId(ctx);

    const { data, image } = this.converter.create(input, userId);

    let uploadedImageData: Prisma.ImageCreateWithoutCommunitiesInput | undefined = undefined;
    if (image) {
      uploadedImageData = await this.imageService.uploadPublicImage(image, "communities");
    }

    const updateInput: Prisma.CommunityCreateInput = {
      ...data,
      image: {
        create: uploadedImageData,
      },
    };

    return this.repository.create(ctx, updateInput, tx);
  }

  async deleteCommunity(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    await this.findCommunityOrThrow(ctx, id);
    return await this.repository.delete(ctx, id, tx);
  }

  async updateCommunityProfile(
    ctx: IContext,
    id: string,
    input: GqlCommunityUpdateProfileInput,
    tx: Prisma.TransactionClient,
  ) {
    await this.findCommunityOrThrow(ctx, id);
    validateConnectOrCreatePlacesInput(input);

    const { data, image } = this.converter.update(input);

    let uploadedImageData: Prisma.ImageCreateWithoutCommunitiesInput | undefined = undefined;
    if (image) {
      uploadedImageData = await this.imageService.uploadPublicImage(image, "communities");
    }

    const updateInput: Prisma.CommunityUpdateInput = {
      ...data,
      image: {
        create: uploadedImageData,
      },
    };

    return await this.repository.update(ctx, id, updateInput, tx);
  }
}

function validateConnectOrCreatePlacesInput(input: GqlCommunityUpdateProfileInput): void {
  if (input.places?.connectOrCreate) {
    input.places.connectOrCreate.forEach((item) => {
      if ((item.where && item.create) || (!item.where && !item.create)) {
        throw new ValidationError(`For each Place, choose only one of "where" or "create."`, [
          JSON.stringify(input.places.connectOrCreate),
        ]);
      }
    });
  }
}
