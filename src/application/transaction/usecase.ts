import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlTransactionsConnection,
  GqlTransaction,
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
import TransactionService from "@/application/transaction/service";
import TransactionPresenter from "@/application/transaction/presenter";
import TransactionUtils from "@/application/transaction/utils";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";

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

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.joinIfNeeded(ctx, toUserId, communityId, tx);

      const { toWalletId } = await WalletService.validateWalletsForGrantOrDonation(
        ctx,
        tx,
        communityId,
        toUserId,
        toPointChange,
      );

      const transaction = await TransactionService.grantCommunityPoint(ctx, input, toWalletId, tx);

      return TransactionPresenter.grantCommunityPoint(transaction);
    });
  }

  static async userDonateSelfPointToAnother(
    ctx: IContext,
    input: GqlTransactionDonateSelfPointInput,
  ): Promise<GqlTransactionDonateSelfPointPayload> {
    const { communityId, toUserId, toPointChange } = input;

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.joinIfNeeded(ctx, toUserId, communityId, tx);

      const { toWalletId } = await WalletService.validateWalletsForGrantOrDonation(
        ctx,
        tx,
        communityId,
        toUserId,
        toPointChange,
      );

      const transaction = await TransactionService.donateSelfPoint(ctx, input, toWalletId, tx);

      return TransactionPresenter.giveUserPoint(transaction);
    });
  }
}
