import {
  GqlMutationTicketIssueArgs,
  GqlMutationTicketPurchaseArgs,
  GqlMutationTicketRefundArgs,
  GqlMutationTicketUseArgs,
  GqlQueryTicketArgs,
  GqlQueryTicketsArgs,
  GqlTicket,
  GqlTicketClaimInput,
  GqlTicketClaimPayload,
  GqlTicketIssuePayload,
  GqlTicketPurchasePayload,
  GqlTicketRefundPayload,
  GqlTicketsConnection,
  GqlTicketUsePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketService from "@/application/domain/ticket/service";
import TicketPresenter from "@/application/domain/ticket/presenter";
import WalletService from "@/application/domain/wallet/service";
import TransactionService from "@/application/domain/transaction/service";
import { Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import WalletValidator from "@/application/domain/wallet/validator";
import { getCurrentUserId } from "@/application/domain/utils";
import MembershipService from "@/application/domain/membership/service";
import TicketClaimLinkService from "@/application/domain/ticketClaimLink/service";
import TicketIssuerService from "@/application/domain/ticketClaimLink/issuer/service";
import TicketIssuerPresenter from "@/application/domain/ticketClaimLink/issuer/presenter";

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

  static async managerIssueTicket(
    ctx: IContext,
    { input }: GqlMutationTicketIssueArgs,
  ): Promise<GqlTicketIssuePayload> {
    const currentUserId = getCurrentUserId(ctx);

    const issuedTicket = await TicketIssuerService.issueTicket(
      ctx,
      currentUserId,
      input.utilityId,
      input.qtyToBeIssued,
    );

    return TicketIssuerPresenter.issue(issuedTicket);
  }

  static async userClaimTicket(
    ctx: IContext,
    { ticketClaimLinkId }: GqlTicketClaimInput,
  ): Promise<GqlTicketClaimPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const claimLink = await TicketClaimLinkService.validateBeforeClaim(ctx, ticketClaimLinkId);

    const issuedTicket = claimLink.issuer;
    const { ownerId: ticketOwnerId, qtyToBeIssued, utility } = issuedTicket;
    const { communityId, pointsRequired } = utility;
    const transferPoints = pointsRequired * qtyToBeIssued;

    const tickets = await this.issuer.public(ctx, async (tx) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      const [ownerWallet, claimerWallet] = await Promise.all([
        WalletService.findMemberWalletOrThrow(ctx, ticketOwnerId, communityId, tx),
        WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx),
      ]);

      const { fromWalletId: ownerWalletId, toWalletId: claimerWalletId } =
        await WalletValidator.validateTransferMemberToMember(
          ownerWallet,
          claimerWallet,
          transferPoints,
        );

      await TransactionService.donateSelfPoint(
        ctx,
        ownerWalletId,
        claimerWalletId,
        transferPoints,
        tx,
      );
      await TransactionService.purchaseTicket(ctx, tx, {
        fromWalletId: claimerWalletId,
        toWalletId: ownerWalletId,
        transferPoints,
      });

      await TicketClaimLinkService.markAsClaimed(ctx, ticketClaimLinkId, qtyToBeIssued, tx);
      return await TicketService.claimTicketsByIssuerId(
        ctx,
        currentUserId,
        ticketClaimLinkId,
        issuedTicket,
        claimerWalletId,
        tx,
      );
    });

    return TicketPresenter.claim(tickets);
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
