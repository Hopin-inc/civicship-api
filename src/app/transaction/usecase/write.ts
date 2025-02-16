import {
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlTransactionIssueCommunityPointPayload,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionDonateSelfPointPayload,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionGrantCommunityPointInput,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionService from "@/app/transaction/service";
import TransactionOutputFormat from "@/presentation/graphql/dto/transaction/output";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import MembershipService from "@/app/membership/service";
import { Prisma } from "@prisma/client";
import WalletService from "@/app/membership/wallet/service";
import TransactionInputFormat from "@/presentation/graphql/dto/transaction/input";
import TransactionRepository from "@/infra/repositories/transaction";
import WalletRepository from "@/infra/repositories/membership/wallet";
import WalletUtils from "@/app/membership/wallet/utils";

export default class TransactionWriteUseCase {
  private static issuer = new PrismaClientIssuer();

  static async ownerIssueCommunityPoint(
    { input }: GqlMutationTransactionIssueCommunityPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionIssueCommunityPointPayload> {
    const res = await TransactionService.issueCommunityPoint(ctx, input);
    return TransactionOutputFormat.issueCommunityPoint(res);
  }

  static async managerGrantCommunityPoint(
    ctx: IContext,
    input: GqlTransactionGrantCommunityPointInput,
  ): Promise<GqlTransactionGrantCommunityPointPayload> {
    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.joinIfNeeded(ctx, input.toUserId, input.communityId, tx);

      const memberWallet = await WalletService.createMemberWalletIfNeeded(
        ctx,
        input.toUserId,
        input.communityId,
        tx,
      );
      const communityWallet = await WalletRepository.findCommunityWallet(
        ctx,
        input.communityId,
        tx,
      );
      await WalletUtils.validateTransfer(input.toPointChange, communityWallet, memberWallet);

      const data = TransactionInputFormat.grantCommunityPoint(input, memberWallet.id);
      const transaction = await TransactionRepository.create(ctx, data, tx);
      await TransactionRepository.refreshCurrentPoints(ctx, tx);

      return TransactionOutputFormat.grantCommunityPoint(transaction);
    });
  }

  static async userDonateSelfPointToAnother(
    ctx: IContext,
    input: GqlTransactionDonateSelfPointInput,
  ): Promise<GqlTransactionDonateSelfPointPayload> {
    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.joinIfNeeded(ctx, input.toUserId, input.communityId, tx);

      const toWallet = await WalletService.createMemberWalletIfNeeded(
        ctx,
        input.toUserId,
        input.communityId,
        tx,
      );
      const fromWallet = await WalletRepository.find(ctx, input.fromWalletId);
      await WalletUtils.validateTransfer(input.toPointChange, fromWallet, toWallet);

      const data = TransactionInputFormat.donateSelfPoint(input, toWallet.id);
      const transaction = await TransactionRepository.create(ctx, data, tx);
      await TransactionRepository.refreshCurrentPoints(ctx, tx);

      return TransactionOutputFormat.giveUserPoint(transaction);
    });
  }
}
