import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlQueryCommunitiesArgs,
} from "@/types/graphql";
import CommunityConverter from "@/application/community/data/converter";
import CommunityRepository from "@/application/community/data/repository";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { getCurrentUserId } from "@/utils";
import { NotFoundError, ValidationError } from "@/errors/graphql";

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

  static async checkIfCommunityExists(ctx: IContext, id: string) {
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

    const data: Prisma.CommunityCreateInput = CommunityConverter.create(input, userId);
    return CommunityRepository.create(ctx, data, tx);
  }

  static async deleteCommunity(ctx: IContext, id: string) {
    await this.checkIfCommunityExists(ctx, id);
    return await CommunityRepository.delete(ctx, id);
  }

  static async updateCommunityProfile(
    ctx: IContext,
    id: string,
    input: GqlCommunityUpdateProfileInput,
  ) {
    await this.checkIfCommunityExists(ctx, id);

    validateConnectOrCreatePlacesInput(input);
    const data: Prisma.CommunityUpdateInput = CommunityConverter.update(input);
    return await CommunityRepository.update(ctx, id, data);
  }
}

function validateConnectOrCreatePlacesInput(input: GqlCommunityUpdateProfileInput): void {
  if (input.places?.connectOrCreate) {
    input.places.connectOrCreate.forEach((item) => {
      if ((item.where && item.create) || (!item.where && !item.create)) {
        throw new ValidationError(
          `For each Place, please specify only one of either 'where' or 'create'. Received: ${JSON.stringify(
            input.places.connectOrCreate,
          )}`,
        );
      }
    });
  }
}
