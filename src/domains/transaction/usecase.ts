import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlTransactionsConnection,
  GqlTransaction,
  GqlTransactionIssueCommunityPointPayload,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionDonateSelfPointPayload,
  GqlParticipation,
  GqlParticipationTransactionsArgs,
  GqlWallet,
  GqlWalletTransactionsArgs,
  GqlUtility,
  GqlUtilityTransactionsArgs,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionGrantCommunityPointInput,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionService from "@/domains/transaction/service";
import TransactionOutputFormat from "@/domains/transaction/presenter/output";
import TransactionUtils from "@/domains/transaction/utils";
import { PrismaClientIssuer } from "@/prisma/client";
import MembershipService from "@/domains/membership/service";
import { Prisma } from "@prisma/client";
import WalletService from "@/domains/membership/wallet/service";
import TransactionInputFormat from "@/domains/transaction/presenter/input";
import TransactionRepository from "@/domains/transaction/repository";

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

  static async visitorBrowseTransactionsByUtility(
    { id }: GqlUtility,
    { first, cursor }: GqlUtilityTransactionsArgs,
    ctx: IContext,
  ) {
    return TransactionUtils.fetchTransactionsCommon(ctx, {
      cursor,
      filter: { utilityId: id },
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

      const wallet = await WalletService.createMemberWalletIfNeeded(
        ctx,
        input.toUserId,
        input.communityId,
        tx,
      );

      const data = TransactionInputFormat.grantCommunityPoint(input, wallet.id);
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

      const wallet = await WalletService.createMemberWalletIfNeeded(
        ctx,
        input.toUserId,
        input.communityId,
        tx,
      );

      const data = TransactionInputFormat.donateSelfPoint(input, wallet.id);
      const transaction = await TransactionRepository.create(ctx, data, tx);
      await TransactionRepository.refreshCurrentPoints(ctx, tx);

      return TransactionOutputFormat.giveUserPoint(transaction);
    });
  }
}
