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

export default class TicketUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseTickets(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryTicketsArgs,
  ): Promise<GqlTicketsConnection> {
    return TicketService.fetchTickets(ctx, { cursor, filter, sort, first });
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
    const memberWallet = await WalletService.checkIfMemberWalletExists(ctx, input.walletId);
    const communityWallet = await WalletService.findCommunityWalletOrThrow(ctx, input.communityId);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await WalletValidator.validateTransfer(input.pointsRequired, memberWallet, communityWallet);

      const transaction = await TransactionService.purchaseTicket(ctx, tx, {
        fromWalletId: memberWallet.id,
        toWalletId: communityWallet.id,
        transferPoints: input.pointsRequired,
      });

      const result = await TicketService.purchaseTicket(
        ctx,
        memberWallet.id,
        input.utilityId,
        transaction.id,
        tx,
      );
      return TicketPresenter.purchase(result);
    });
  }

  static async memberUseTicket(
    ctx: IContext,
    { id }: GqlMutationTicketUseArgs,
  ): Promise<GqlTicketUsePayload> {
    const result = await TicketService.useTicket(ctx, id);
    return TicketPresenter.use(result);
  }

  static async memberRefundTicket(
    ctx: IContext,
    { id, input }: GqlMutationTicketRefundArgs,
  ): Promise<GqlTicketRefundPayload> {
    const memberWallet = await WalletService.checkIfMemberWalletExists(ctx, input.walletId);
    const communityWallet = await WalletService.findCommunityWalletOrThrow(ctx, input.communityId);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await WalletValidator.validateTransfer(input.pointsRequired, communityWallet, memberWallet);

      const transaction = await TransactionService.refundTicket(ctx, tx, {
        fromWalletId: memberWallet.id,
        toWalletId: communityWallet.id,
        transferPoints: input.pointsRequired,
      });

      const result = await TicketService.refundTicket(ctx, id, transaction.id, tx);
      return TicketPresenter.refund(result);
    });
  }
}
