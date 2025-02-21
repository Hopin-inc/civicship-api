import {
  GqlCommunityCreateInput,
  GqlCommunityUpdateProfileInput,
  GqlQueryCommunitiesArgs,
} from "@/types/graphql";
import CommunityInputFormat from "@/presentation/graphql/dto/community/input";
import CommunityRepository from "@/infra/repositories/community";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { getCurrentUserId } from "@/utils";

export default class CommunityService {
  static async fetchCommunities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryCommunitiesArgs,
    take: number,
  ) {
    const where = CommunityInputFormat.filter(filter ?? {});
    const orderBy = CommunityInputFormat.sort(sort ?? {});

    return await CommunityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findCommunity(ctx: IContext, id: string) {
    return await CommunityRepository.find(ctx, id);
  }

  static async createCommunity(
    ctx: IContext,
    input: GqlCommunityCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const userId = getCurrentUserId(ctx);
    const data: Prisma.CommunityCreateInput = CommunityInputFormat.create(input, userId);

    return CommunityRepository.create(ctx, data, tx);
  }

  static async deleteCommunity(ctx: IContext, id: string) {
    const community = await CommunityRepository.find(ctx, id);
    if (!community) {
      throw new Error(`CommunityNotFound: ID=${id}`);
    }

    return await CommunityRepository.delete(ctx, id);
  }

  static async updateCommunityProfile(
    ctx: IContext,
    id: string,
    input: GqlCommunityUpdateProfileInput,
  ) {
    const community = await CommunityRepository.find(ctx, id);
    if (!community) {
      throw new Error(`CommunityNotFound: ID=${id}`);
    }

    const data: Prisma.CommunityUpdateInput = CommunityInputFormat.update(input);
    return await CommunityRepository.update(ctx, id, data);
  }
}
