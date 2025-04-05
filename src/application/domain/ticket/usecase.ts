import {
  GqlQueryTicketsArgs,
  GqlQueryTicketArgs,
  GqlMutationTicketPurchaseArgs,
  GqlMutationTicketUseArgs,
  GqlMutationTicketRefundArgs,
  GqlTicket,
  GqlTicketsConnection,
  GqlTicketPurchasePayload,
  GqlTicketUsePayload,
  GqlTicketRefundPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketService from "@/application/domain/ticket/service";
import TicketPresenter from "@/application/domain/ticket/presenter";
import WalletService from "@/application/domain/membership/wallet/service";
import TransactionService from "@/application/domain/transaction/service";
import { Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import WalletValidator from "@/application/domain/membership/wallet/validator";
import { clampFirst } from "@/application/domain/utils";

export default class TicketUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseTickets(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryTicketsArgs,
  ): Promise<GqlTicketsConnection> {
    const take = clampFirst(first);
    const records = await TicketService.fetchTickets(ctx, { cursor, filter, sort }, take);

    const hasNextPage = records.length > take;
    return TicketPresenter.query(records, hasNextPage, take);
  }

  static async visitorViewTicket(
    ctx: IContext,
    { id }: GqlQueryTicketArgs,
  ): Promise<GqlTicket | null> {
    const ticket = await TicketService.findTicket(ctx, id);
    if (!ticket) {
      return null;
    }
    return TicketPresenter.get(ticket);
  }

  static async memberPurchaseTicket(
    ctx: IContext,
    { input }: GqlMutationTicketPurchaseArgs,
  ): Promise<GqlTicketPurchasePayload> {
    const [memberWallet, communityWallet] = await Promise.all([
      WalletService.checkIfMemberWalletExists(ctx, input.walletId),
      WalletService.findCommunityWalletOrThrow(ctx, input.communityId),
    ]);
    await WalletValidator.validateTransfer(input.pointsRequired, memberWallet, communityWallet);

    const ticket = await this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const transaction = await TransactionService.purchaseTicket(ctx, tx, {
        fromWalletId: memberWallet.id,
        toWalletId: communityWallet.id,
        transferPoints: input.pointsRequired,
      });

      return await TicketService.purchaseTicket(
        ctx,
        memberWallet.id,
        input.utilityId,
        transaction.id,
        tx,
      );
    });

    return TicketPresenter.purchase(ticket);
  }

  static async memberUseTicket(
    ctx: IContext,
    { id }: GqlMutationTicketUseArgs,
  ): Promise<GqlTicketUsePayload> {
    const ticket = await TicketService.useTicket(ctx, id);
    return TicketPresenter.use(ticket);
  }

  static async memberRefundTicket(
    ctx: IContext,
    { id, input }: GqlMutationTicketRefundArgs,
  ): Promise<GqlTicketRefundPayload> {
    const [memberWallet, communityWallet] = await Promise.all([
      WalletService.checkIfMemberWalletExists(ctx, input.walletId),
      WalletService.findCommunityWalletOrThrow(ctx, input.communityId),
    ]);
    await WalletValidator.validateTransfer(input.pointsRequired, communityWallet, memberWallet);

    const ticket = await this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const transaction = await TransactionService.refundTicket(ctx, tx, {
        fromWalletId: memberWallet.id,
        toWalletId: communityWallet.id,
        transferPoints: input.pointsRequired,
      });

      return await TicketService.refundTicket(ctx, id, transaction.id, tx);
    });

    return TicketPresenter.refund(ticket);
  }
}
