import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlTransactionsConnection,
  GqlTransaction,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlTransactionIssueCommunityPointPayload,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionDonateSelfPointPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionService from "@/application/transaction/service";
import TransactionPresenter from "@/application/transaction/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma, TransactionReason } from "@prisma/client";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import { getCurrentUserId } from "@/application/utils";

export default class TransactionUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseTransactions(
    { filter, sort, cursor, first }: GqlQueryTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    return TransactionService.fetchTransactions(ctx, {
      filter,
      sort,
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
    return TransactionPresenter.get(res);
  }

  static async ownerIssueCommunityPoint(
    { input }: GqlMutationTransactionIssueCommunityPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionIssueCommunityPointPayload> {
    const res = await TransactionService.issueCommunityPoint(ctx, input);
    return TransactionPresenter.issueCommunityPoint(res);
  }

  static async managerGrantCommunityPoint(
    ctx: IContext,
    input: GqlTransactionGrantCommunityPointInput,
  ): Promise<GqlTransactionGrantCommunityPointPayload> {
    const { communityId, toUserId, toPointChange } = input;
    const currentUserId = getCurrentUserId(ctx);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx, toUserId);
      const { toWalletId } = await WalletService.validateCommunityMemberTransfer(
        ctx,
        tx,
        communityId,
        toUserId,
        toPointChange,
        TransactionReason.GRANT,
      );

      const transaction = await TransactionService.grantCommunityPoint(ctx, input, toWalletId, tx);

      return TransactionPresenter.grantCommunityPoint(transaction);
    });
  }

  static async userDonateSelfPointToAnother(
    ctx: IContext,
    input: GqlTransactionDonateSelfPointInput,
  ): Promise<GqlTransactionDonateSelfPointPayload> {
    const { communityId, fromWalletId, toUserId, toPointChange } = input;

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.joinIfNeeded(ctx, toUserId, communityId, tx);

      const { toWalletId } = await WalletService.validateMemberToMemberDonation(
        ctx,
        tx,
        fromWalletId,
        toUserId,
        communityId,
        toPointChange,
      );

      const transaction = await TransactionService.donateSelfPoint(ctx, input, toWalletId, tx);

      return TransactionPresenter.giveUserPoint(transaction);
    });
  }
}
