import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlQueryCommunitiesArgs,
} from "@/types/graphql";
import CommunityConverter from "@/application/domain/community/data/converter";
import CommunityRepository from "@/application/domain/community/data/repository";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { getCurrentUserId } from "@/application/domain/utils";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import ImageService from "@/application/domain/image/service";

export default class CommunityService {
  static async fetchCommunities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryCommunitiesArgs,
    take: number,
  ) {
    const where = CommunityConverter.filter(filter ?? {});
    const orderBy = CommunityConverter.sort(sort ?? {});

    return await CommunityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findCommunity(ctx: IContext, id: string) {
    return await CommunityRepository.find(ctx, id);
  }

  static async findCommunityOrThrow(ctx: IContext, id: string) {
    const community = await CommunityRepository.find(ctx, id);
    if (!community) {
      throw new NotFoundError("Community", { id });
    }
    return community;
  }

  static async createCommunityAndJoinAsOwner(
    ctx: IContext,
    input: GqlCommunityCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const userId = getCurrentUserId(ctx);

    const { data, image } = CommunityConverter.create(input, userId);

    let uploadedImageData: Prisma.ImageCreateWithoutCommunitiesInput | undefined = undefined;
    if (image) {
      uploadedImageData = await ImageService.uploadPublicImage(image, "communities");
    }

    const updateInput: Prisma.CommunityCreateInput = {
      ...data,
      image: {
        create: uploadedImageData,
      },
    };

    return CommunityRepository.create(ctx, updateInput, tx);
  }

  static async deleteCommunity(ctx: IContext, id: string) {
    await this.findCommunityOrThrow(ctx, id);
    return await CommunityRepository.delete(ctx, id);
  }

  static async updateCommunityProfile(
    ctx: IContext,
    id: string,
    input: GqlCommunityUpdateProfileInput,
  ) {
    await this.findCommunityOrThrow(ctx, id);
    validateConnectOrCreatePlacesInput(input);

    const { data, image } = CommunityConverter.update(input);

    let uploadedImageData: Prisma.ImageCreateWithoutCommunitiesInput | undefined = undefined;
    if (image) {
      uploadedImageData = await ImageService.uploadPublicImage(image, "communities");
    }

    const updateInput: Prisma.CommunityUpdateInput = {
      ...data,
      image: {
        create: uploadedImageData,
      },
    };

    return await CommunityRepository.update(ctx, id, updateInput);
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
