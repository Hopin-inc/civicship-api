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
import TransactionService from "@/application/domain/transaction/service";
import TransactionPresenter from "@/application/domain/transaction/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma, TransactionReason } from "@prisma/client";
import MembershipService from "@/application/domain/membership/service";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import WalletValidator from "@/application/domain/membership/wallet/validator";
import WalletService from "@/application/domain/membership/wallet/service";

export default class TransactionUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseTransactions(
    { filter, sort, cursor, first }: GqlQueryTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    const take = clampFirst(first);

    const records = await TransactionService.fetchTransactions(
      ctx,
      {
        filter,
        sort,
        cursor,
      },
      take,
    );

    const hasNextPage = records.length > take;
    const data: GqlTransaction[] = records.slice(0, take).map((record) => {
      return TransactionPresenter.get(record);
    });
    return TransactionPresenter.query(data, hasNextPage);
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
      const { toWalletId } = await WalletValidator.validateCommunityMemberTransfer(
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

      const [fromWallet, toWallet] = await Promise.all([
        WalletService.checkIfMemberWalletExists(ctx, fromWalletId),
        WalletService.createMemberWalletIfNeeded(ctx, toUserId, communityId, tx),
      ]);

      const { toWalletId } = await WalletValidator.validateMemberToMemberDonation(
        fromWallet,
        toWallet,
        toPointChange,
      );

      const transaction = await TransactionService.donateSelfPoint(ctx, input, toWalletId, tx);

      return TransactionPresenter.giveUserPoint(transaction);
    });
  }
}
