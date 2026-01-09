import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlQueryCommunitiesArgs,
} from "@/types/graphql";
import CommunityConverter from "@/application/domain/account/community/data/converter";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import ImageService from "@/application/domain/content/image/service";
import { inject, injectable } from "tsyringe";
import ICommunityRepository from "@/application/domain/account/community/data/interface";

@injectable()
export default class CommunityService {
  constructor(
    @inject("CommunityRepository") private readonly repository: ICommunityRepository,
    @inject("CommunityConverter") private readonly converter: CommunityConverter,
    @inject("ImageService") private readonly imageService: ImageService,
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
    currentUserId: string,
    input: GqlCommunityCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const { data, image } = this.converter.create(input, currentUserId);

    let uploadedImageData: Prisma.ImageCreateWithoutCommunitiesInput | undefined = undefined;
    if (image) {
      const result = await this.imageService.uploadPublicImage(image, "communities");
      if (result) {
        uploadedImageData = result;
      }
    }

    const updateInput: Prisma.CommunityCreateInput = {
      ...data,
      image: uploadedImageData ? {
        create: uploadedImageData,
      } : undefined,
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

    const { data, image } = this.converter.update(input);

    let uploadedImageData: Prisma.ImageCreateWithoutCommunitiesInput | undefined = undefined;
    if (image) {
      const result = await this.imageService.uploadPublicImage(image, "communities");
      if (result) {
        uploadedImageData = result;
      }
    }

    const updateInput: Prisma.CommunityUpdateInput = {
      ...data,
      image: uploadedImageData ? {
        create: uploadedImageData,
      } : undefined,
    };

    return await this.repository.update(ctx, id, updateInput, tx);
  }

  async getCommunityName(ctx: IContext, communityId: string): Promise<string> {
    const name = await this.repository.findNameById(ctx, communityId);
    return name ?? "コミュニティ";
  }
}
