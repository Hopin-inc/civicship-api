import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionPresenter from "@/application/domain/transaction/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import WalletService from "@/application/domain/account/wallet/service";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import {
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlQueryTransactionArgs,
  GqlQueryTransactionsArgs,
  GqlTransaction,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionDonateSelfPointPayload,
  GqlTransactionGrantCommunityPointInput,
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
  ) {}

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
    console.log(data);
    return TransactionPresenter.query(data, hasNextPage);
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
    { input }: GqlMutationTransactionIssueCommunityPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionIssueCommunityPointPayload> {
    const res = await ctx.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      return await this.transactionService.issueCommunityPoint(ctx, input, tx);
    });
    return TransactionPresenter.issueCommunityPoint(res);
  }

  async ownerGrantCommunityPoint(
    ctx: IContext,
    input: GqlTransactionGrantCommunityPointInput,
  ): Promise<GqlTransactionGrantCommunityPointPayload> {
    const { communityId, toUserId, transferPoints } = input;
    const currentUserId = getCurrentUserId(ctx);

    return await ctx.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await this.membershipService.joinIfNeeded(ctx, currentUserId, communityId, tx, toUserId);
      const { toWalletId } = await this.walletValidator.validateCommunityMemberTransfer(
        ctx,
        tx,
        communityId,
        toUserId,
        transferPoints,
        TransactionReason.GRANT,
      );

      const transaction = await this.transactionService.grantCommunityPoint(
        ctx,
        input,
        toWalletId,
        tx,
      );
      return TransactionPresenter.grantCommunityPoint(transaction);
    });
  }

  async userDonateSelfPointToAnother(
    ctx: IContext,
    input: GqlTransactionDonateSelfPointInput,
  ): Promise<GqlTransactionDonateSelfPointPayload> {
    const { communityId, fromWalletId, toUserId, transferPoints } = input;

    return ctx.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await this.membershipService.joinIfNeeded(ctx, toUserId, communityId, tx);

      const [fromWallet, toWallet] = await Promise.all([
        this.walletService.checkIfMemberWalletExists(ctx, fromWalletId),
        this.walletService.createMemberWalletIfNeeded(ctx, toUserId, communityId, tx),
      ]);

      const { toWalletId } = await this.walletValidator.validateTransferMemberToMember(
        fromWallet,
        toWallet,
        transferPoints,
      );

      const transaction = await this.transactionService.donateSelfPoint(
        ctx,
        fromWalletId,
        toWalletId,
        transferPoints,
        tx,
      );

      return TransactionPresenter.giveUserPoint(transaction);
    });
  }
}
