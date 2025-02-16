import {
  GqlQueryUtilitiesArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlMutationUtilityUseArgs,
  GqlUtilityCreateInput,
} from "@/types/graphql";
import UtilityRepository from "@/infra/repositories/utility";
import { IContext } from "@/types/server";
import UtilityInputFormat from "@/presen/graphql/dto/utility/input";
import { Prisma } from "@prisma/client";
import CommunityRepository from "@/infra/repositories/community";
import TransactionService from "@/app/transaction/service";
import WalletRepository from "@/infra/repositories/membership/wallet";

export default class UtilityService {
  static async fetchUtilities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUtilitiesArgs,
    take: number,
  ) {
    const where = UtilityInputFormat.filter(filter ?? {});
    const orderBy = UtilityInputFormat.sort(sort ?? {});
    return UtilityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findUtility(ctx: IContext, id: string) {
    return await UtilityRepository.find(ctx, id);
  }

  static async createUtility(ctx: IContext, input: GqlUtilityCreateInput) {
    const data: Prisma.UtilityCreateInput = UtilityInputFormat.create(input);
    return UtilityRepository.create(ctx, data);
  }

  static async deleteUtility(ctx: IContext, id: string) {
    return UtilityRepository.delete(ctx, id);
  }

  static async updateUtilityInfo(ctx: IContext, { id, input }: GqlMutationUtilityUpdateInfoArgs) {
    const data: Prisma.UtilityUpdateInput = UtilityInputFormat.updateInfo(input);
    return UtilityRepository.update(ctx, id, data);
  }

  static async useUtility(ctx: IContext, { id, input }: GqlMutationUtilityUseArgs) {
    const utility = await UtilityRepository.find(ctx, id);
    if (!utility) {
      throw new Error(`UtilityNotFound: ID=${id}`);
    }
    const community = await CommunityRepository.find(ctx, utility.communityId);
    if (!community) {
      throw new Error(`CommunityNotFound: ID=${utility.communityId}`);
    }

    const communityWallet = await WalletRepository.findCommunityWallet(ctx, utility.communityId);
    if (!communityWallet?.id) {
      throw new Error("Wallet information is missing for points transfer");
    }

    return await TransactionService.useUtility(ctx, {
      communityId: input.communityId,
      fromWalletId: input.userWalletId,
      fromPointChange: -utility.pointsRequired,
      toWalletId: communityWallet.id,
      toPointChange: utility.pointsRequired,
      utilityId: id,
    });
  }
}
