import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlUtility,
  GqlUtilitiesConnection,
  GqlCommunity,
  GqlCommunityUtilitiesArgs,
  GqlMutationUtilityCreateArgs,
  GqlUtilityCreatePayload,
  GqlMutationUtilityDeleteArgs,
  GqlUtilityDeletePayload,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityUpdateInfoPayload,
  GqlMutationUtilityRedeemedArgs,
  GqlUtilityRedeemedPayload,
} from "@/types/graphql";
import UtilityService from "@/app/utility/service";
import UtilityOutputFormat from "@/presentation/graphql/dto/utility/output";
import { IContext } from "@/types/server";
import { UtilityUtils } from "@/app/utility/utils";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import WalletService from "@/app/membership/wallet/service";
import { Prisma } from "@prisma/client";
import TransactionService from "@/app/transaction/service";
import UtilityHistoryService from "@/app/utility/history/service";

export default class UtilityUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseUtilities(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUtilitiesArgs,
  ): Promise<GqlUtilitiesConnection> {
    return UtilityUtils.fetchUtilitiesCommon(ctx, {
      cursor,
      filter,
      sort,
      first,
    });
  }

  static async visitorBrowseUtilitiesByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityUtilitiesArgs,
    ctx: IContext,
  ): Promise<GqlUtilitiesConnection> {
    return UtilityUtils.fetchUtilitiesCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorViewUtility(
    ctx: IContext,
    { id }: GqlQueryUtilityArgs,
  ): Promise<GqlUtility | null> {
    const utility = await UtilityService.findUtility(ctx, id);
    if (!utility) {
      return null;
    }
    return UtilityOutputFormat.get(utility);
  }

  static async managerCreateUtility(
    ctx: IContext,
    { input }: GqlMutationUtilityCreateArgs,
  ): Promise<GqlUtilityCreatePayload> {
    const res = await UtilityService.createUtility(ctx, input);
    return UtilityOutputFormat.create(res);
  }

  static async managerDeleteUtility(
    ctx: IContext,
    { id }: GqlMutationUtilityDeleteArgs,
  ): Promise<GqlUtilityDeletePayload> {
    const res = await UtilityService.deleteUtility(ctx, id);
    return UtilityOutputFormat.delete(res);
  }

  static async managerUpdateUtilityInfo(
    ctx: IContext,
    { id, input }: GqlMutationUtilityUpdateInfoArgs,
  ): Promise<GqlUtilityUpdateInfoPayload> {
    const res = await UtilityService.updateUtilityInfo(ctx, { id, input });
    return UtilityOutputFormat.updateInfo(res);
  }

  static async memberRedeemedUtility(
    ctx: IContext,
    { id, input }: GqlMutationUtilityRedeemedArgs,
  ): Promise<GqlUtilityRedeemedPayload> {
    const utility = await UtilityService.findUtilityOrThrow(ctx, id);
    const { fromWalletId, toWalletId } = await WalletService.findWalletsForRedeemedUtility(
      ctx,
      input.userWalletId,
      input.communityId,
      utility.pointsRequired,
    );

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const transaction = await TransactionService.redeemedUtility(ctx, tx, {
        fromWalletId,
        toWalletId,
        transferPoints: utility.pointsRequired,
      });

      await UtilityHistoryService.recordUtilityHistory(
        ctx,
        tx,
        input.userWalletId,
        id,
        transaction.id,
        new Date(),
      );

      return UtilityOutputFormat.redeemedUtility(transaction);
    });
  }

  // static async memberUseUtility(
  //   ctx: IContext,
  //   { id, input }: GqlMutationUtilityUseArgs,
  // ): Promise<GqlUtilityUsePayload> {
  //   const communityWallet = await WalletService.findCommunityWalletOrThrow(ctx, input.communityId);
  //
  //   return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
  //     await UtilityHistoryService.recordUtilityHistory(
  //       ctx,
  //       tx,
  //       input.userWalletId,
  //       id,
  //       transaction.id,
  //       new Date(),
  //     );
  //     return UtilityOutputFormat.useUtility(transaction);
  //   });
  // }
}
