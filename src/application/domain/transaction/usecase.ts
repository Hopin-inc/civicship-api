import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionPresenter from "@/application/domain/transaction/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import WalletService from "@/application/domain/account/wallet/service";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import {
  GqlMutationTransactionDonateSelfPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlQueryTransactionArgs,
  GqlQueryTransactionsArgs,
  GqlTransaction,
  GqlTransactionDonateSelfPointPayload,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionIssueCommunityPointPayload,
  GqlTransactionsConnection,
} from "@/types/graphql";
import { inject, injectable } from "tsyringe";

@injectable()
export default class TransactionUseCase {
  constructor(
    @inject("TransactionService") private readonly transactionService: ITransactionService,
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("WalletValidator") private readonly walletValidator: WalletValidator,
  ) { }

  async visitorBrowseTransactions(
    { filter, sort, cursor, first }: GqlQueryTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    const take = clampFirst(first);
    const records = await this.transactionService.fetchTransactions(
      ctx,
      { filter, sort, cursor },
      take,
    );

    const hasNextPage = records.length > take;
    const data: GqlTransaction[] = records.slice(0, take).map((record) => {
      return TransactionPresenter.get(record);
    });
    return TransactionPresenter.query(data, hasNextPage, cursor);
  }

  async visitorViewTransaction(
    { id }: GqlQueryTransactionArgs,
    ctx: IContext,
  ): Promise<GqlTransaction | null> {
    const res = await this.transactionService.findTransaction(ctx, id);
    if (!res) {
      return null;
    }
    return TransactionPresenter.get(res);
  }

  async ownerIssueCommunityPoint(
    { input, permission }: GqlMutationTransactionIssueCommunityPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionIssueCommunityPointPayload> {
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(
      ctx,
      permission.communityId,
    );
    const res = await ctx.issuer.onlyBelongingCommunity(
      ctx,
      async (tx: Prisma.TransactionClient) => {
        return await this.transactionService.issueCommunityPoint(
          ctx,
          input.transferPoints,
          communityWallet.id,
          tx,
          input.comment,
        );
      },
    );
    return TransactionPresenter.issueCommunityPoint(res);
  }

  async ownerGrantCommunityPoint(
    ctx: IContext,
    { input, permission }: GqlMutationTransactionGrantCommunityPointArgs,
  ): Promise<GqlTransactionGrantCommunityPointPayload> {
    const { toUserId, transferPoints, comment } = input;
    const currentUserId = getCurrentUserId(ctx);
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(
      ctx,
      permission.communityId,
    );

    return await ctx.issuer.onlyBelongingCommunity(ctx, async (tx: Prisma.TransactionClient) => {
      await this.membershipService.joinIfNeeded(
        ctx,
        currentUserId,
        permission.communityId,
        tx,
        toUserId,
      );
      const { toWalletId } = await this.walletValidator.validateCommunityMemberTransfer(
        ctx,
        tx,
        permission.communityId,
        toUserId,
        transferPoints,
        TransactionReason.GRANT,
      );

      const transaction = await this.transactionService.grantCommunityPoint(
        ctx,
        transferPoints,
        communityWallet.id,
        toWalletId,
        tx,
        comment,
      );
      return TransactionPresenter.grantCommunityPoint(transaction);
    });
  }

  async userDonateSelfPointToAnother(
    ctx: IContext,
    { input }: GqlMutationTransactionDonateSelfPointArgs,
  ): Promise<GqlTransactionDonateSelfPointPayload> {
    const { communityId, toUserId, transferPoints, comment } = input;
    const currentUserId = getCurrentUserId(ctx);
    const fromWallet = await this.walletService.findMemberWalletOrThrow(
      ctx,
      currentUserId,
      communityId,
    );

    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx: Prisma.TransactionClient) => {
      const toWallet = await this.walletService.findMemberWalletOrThrow(
        ctx,
        toUserId,
        communityId,
      );

      const { toWalletId } = await this.walletValidator.validateTransferMemberToMember(
        fromWallet,
        toWallet,
        transferPoints,
      );

      const transaction = await this.transactionService.donateSelfPoint(
        ctx,
        fromWallet.id,
        toWalletId,
        transferPoints,
        tx,
        TransactionReason.DONATION,
        comment,
      );

      return TransactionPresenter.giveUserPoint(transaction);
    });
  }
}
