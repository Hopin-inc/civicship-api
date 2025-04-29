import { inject, injectable } from "tsyringe";
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
import { Prisma } from "@prisma/client";
import TicketService from "@/application/domain/reward/ticket/service";
import TicketPresenter from "@/application/domain/reward/ticket/presenter";
import TicketIssuerService from "@/application/domain/reward/ticketIssuer/service";
import TicketIssuerPresenter from "@/application/domain/reward/ticketIssuer/presenter";
import TicketClaimLinkService from "@/application/domain/reward/ticketClaimLink/service";
import WalletService from "@/application/domain/account/wallet/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import MembershipService from "@/application/domain/account/membership/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";

@injectable()
export default class TicketUseCase {
  constructor(
    @inject("TicketService") private readonly ticketService: TicketService,
    @inject("TicketIssuerService") private readonly ticketIssuerService: TicketIssuerService,
    @inject("TicketClaimLinkService")
    private readonly ticketClaimLinkService: TicketClaimLinkService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("WalletValidator") private readonly walletValidator: WalletValidator,
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("TransactionService") private readonly transactionService: ITransactionService,
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
  ) {}

  async visitorBrowseTickets(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryTicketsArgs,
  ): Promise<GqlTicketsConnection> {
    return this.ticketService.fetchTickets(ctx, { cursor, filter, sort, first });
  }

  async visitorViewTicket(ctx: IContext, { id }: GqlQueryTicketArgs): Promise<GqlTicket | null> {
    const ticket = await this.ticketService.findTicket(ctx, id);
    if (!ticket) {
      return null;
    }
    return TicketPresenter.get(ticket);
  }

  async managerIssueTicket(
    ctx: IContext,
    { input }: GqlMutationTicketIssueArgs,
  ): Promise<GqlTicketIssuePayload> {
    const currentUserId = getCurrentUserId(ctx);

    const issuedTicket = await this.ticketIssuerService.issueTicket(
      ctx,
      currentUserId,
      input.utilityId,
      input.qtyToBeIssued,
    );

    return TicketIssuerPresenter.issue(issuedTicket);
  }

  async userClaimTicket(
    ctx: IContext,
    { ticketClaimLinkId }: GqlTicketClaimInput,
  ): Promise<GqlTicketClaimPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const claimLink = await this.ticketClaimLinkService.validateBeforeClaim(ctx, ticketClaimLinkId);
    const issuedTicket = claimLink.issuer;
    const { ownerId: ticketOwnerId, qtyToBeIssued, utility } = issuedTicket;
    const { communityId, pointsRequired } = utility;
    const transferPoints = pointsRequired * qtyToBeIssued;

    const tickets = await this.issuer.public(ctx, async (tx) => {
      await this.membershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      const [ownerWallet, claimerWallet] = await Promise.all([
        this.walletService.findMemberWalletOrThrow(ctx, ticketOwnerId, communityId),
        this.walletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx),
      ]);

      const { fromWalletId: ownerWalletId, toWalletId: claimerWalletId } =
        await this.walletValidator.validateTransferMemberToMember(
          ownerWallet,
          claimerWallet,
          transferPoints,
        );

      await this.transactionService.donateSelfPoint(
        ctx,
        ownerWalletId,
        claimerWalletId,
        transferPoints,
        tx,
      );

      await this.transactionService.purchaseTicket(
        ctx,
        tx,
        claimerWalletId,
        ownerWalletId,
        transferPoints,
      );

      await this.ticketClaimLinkService.markAsClaimed(ctx, ticketClaimLinkId, qtyToBeIssued, tx);

      return await this.ticketService.claimTicketsByIssuerId(
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

  async memberPurchaseTicket(
    ctx: IContext,
    { input }: GqlMutationTicketPurchaseArgs,
  ): Promise<GqlTicketPurchasePayload> {
    const memberWallet = await this.walletService.checkIfMemberWalletExists(ctx, input.walletId);
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(
      ctx,
      input.communityId,
    );

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await this.walletValidator.validateTransfer(
        input.pointsRequired,
        memberWallet,
        communityWallet,
      );

      const transaction = await this.transactionService.purchaseTicket(
        ctx,
        tx,
        memberWallet.id,
        communityWallet.id,
        input.pointsRequired,
      );

      const result = await this.ticketService.purchaseTicket(
        ctx,
        memberWallet.id,
        input.utilityId,
        transaction.id,
        tx,
      );
      return TicketPresenter.purchase(result);
    });
  }

  async memberUseTicket(
    ctx: IContext,
    { id }: GqlMutationTicketUseArgs,
  ): Promise<GqlTicketUsePayload> {
    const result = await this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      return await this.ticketService.useTicket(ctx, id, tx);
    });
    return TicketPresenter.use(result);
  }

  async memberRefundTicket(
    ctx: IContext,
    { id, input }: GqlMutationTicketRefundArgs,
  ): Promise<GqlTicketRefundPayload> {
    const memberWallet = await this.walletService.checkIfMemberWalletExists(ctx, input.walletId);
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(
      ctx,
      input.communityId,
    );

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await this.walletValidator.validateTransfer(
        input.pointsRequired,
        communityWallet,
        memberWallet,
      );

      const transaction = await this.transactionService.refundTicket(
        ctx,
        tx,
        memberWallet.id,
        communityWallet.id,
        input.pointsRequired,
      );

      const result = await this.ticketService.refundTicket(ctx, id, transaction.id, tx);
      return TicketPresenter.refund(result);
    });
  }
}
