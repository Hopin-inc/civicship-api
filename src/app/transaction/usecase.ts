import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlTransactionsConnection,
  GqlTransaction,
  GqlParticipation,
  GqlParticipationTransactionsArgs,
  GqlWallet,
  GqlWalletTransactionsArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlTransactionIssueCommunityPointPayload,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionDonateSelfPointPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionService from "@/app/transaction/service";
import TransactionOutputFormat from "@/presentation/graphql/dto/transaction/output";
import TransactionUtils from "@/app/transaction/utils";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import { Prisma } from "@prisma/client";
import MembershipService from "@/app/membership/service";
import WalletService from "@/app/membership/wallet/service";
import WalletRepository from "@/infra/repositories/membership/wallet";
import WalletUtils from "@/app/membership/wallet/utils";
import TransactionInputFormat from "@/presentation/graphql/dto/transaction/input";
import TransactionRepository from "@/infra/repositories/transaction";

export default class TransactionUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseTransactions(
    { filter, sort, cursor, first }: GqlQueryTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    return TransactionUtils.fetchTransactionsCommon(ctx, {
      filter,
      sort,
      cursor,
      first,
    });
  }

  static async visitorBrowseTransactionsByParticipation(
    { id }: GqlParticipation,
    { first, cursor }: GqlParticipationTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    return TransactionUtils.fetchTransactionsCommon(ctx, {
      filter: { participationId: id },
      cursor,
      first,
    });
  }

  static async visitorBrowseTransactionsByWallet(
    { id }: GqlWallet,
    { first, cursor }: GqlWalletTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    return TransactionUtils.fetchTransactionsCommon(ctx, {
      filter: { fromWalletId: id, toWalletId: id },
      cursor,
      first,
    });
  }

  static async visitorViewTransaction(
    { id }: GqlQueryTransactionArgs,
    ctx: IContext,
  ): Promise<GqlTransaction | null> {
    const res = await TransactionService.findTransaction(ctx, id);
    if (!res) {
      return null;
    }
    return TransactionOutputFormat.get(res);
  }

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
