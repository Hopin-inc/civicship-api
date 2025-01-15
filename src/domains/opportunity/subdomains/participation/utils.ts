import ParticipationStatusHistoryRepository from "@/domains/opportunity/subdomains/participationStatusHistory/repository";
import { IContext } from "@/types/server";
import { ParticipationStatus, Prisma, WalletType } from "@prisma/client";
import { ParticipationPayloadWithArgs } from "@/domains/opportunity/subdomains/participation/type";
import OpportunityRepository from "@/domains/opportunity/repository";
import TransactionService from "@/domains/transaction/service";
import ParticipationStatusHistoryInputFormat from "@/domains/opportunity/subdomains/participationStatusHistory/presenter/input";
import { GqlWallet } from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import ParticipationRepository from "@/domains/opportunity/subdomains/participation/repository";

export const ParticipationUtils = {
  async setParticipationStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    withPointsTransfer = false,
  ) {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) {
      throw new Error("Unauthorized: User must be logged in");
    }

    return prismaClient.$transaction(async (tx) => {
      const participation: ParticipationPayloadWithArgs =
        await ParticipationRepository.setStatusWithTransaction(ctx, tx, id, status);

      if (withPointsTransfer && status === ParticipationStatus.APPROVED) {
        await this.handlePointsTransfer(ctx, tx, participation, currentUserId);
      }

      await this.recordParticipationHistory(ctx, tx, id, status, currentUserId);

      return participation;
    });
  },

  async handlePointsTransfer(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participation: ParticipationPayloadWithArgs,
    currentUserId: string,
  ) {
    if (!participation.opportunityId) {
      throw new Error(`Opportunity with ID ${participation.opportunityId} not found`);
    }

    const opportunity = await OpportunityRepository.findWithTransaction(
      ctx,
      tx,
      participation.opportunityId,
    );

    if (!opportunity) {
      throw new Error(`Opportunity with ID ${participation.opportunityId} not found`);
    }

    const { communityWallet, userWallet } = this.validateTransfer(
      opportunity.community.wallets,
      currentUserId,
      opportunity.pointsPerParticipation,
    );

    await TransactionService.transferPointsWithTransaction(ctx, tx, {
      reason: "PARTICIPATION_APPROVED",
      fromWalletId: communityWallet.id,
      fromPointChange: -opportunity.pointsPerParticipation,
      toWalletId: userWallet.id,
      toPointChange: opportunity.pointsPerParticipation,
      participationId: participation.id,
    });
  },

  async recordParticipationHistory(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participationId: string,
    status: ParticipationStatus,
    createdById: string,
  ) {
    const historyData = ParticipationStatusHistoryInputFormat.create({
      participationId,
      status,
      createdById,
    });

    await ParticipationStatusHistoryRepository.createWithTransaction(ctx, tx, historyData);
  },

  validateTransfer(
    wallets: GqlWallet[],
    currentUserId: string,
    requiredPoints: number,
  ): { communityWallet: GqlWallet; userWallet: GqlWallet } {
    const communityWallet = wallets.find((w) => w.type === WalletType.COMMUNITY);
    const userWallet = wallets.find((w) => w.user?.id === currentUserId);

    if (!communityWallet?.id || !userWallet?.id) {
      throw new Error("Wallet information is missing for points transfer");
    }

    const { currentPoint } = communityWallet.currentPointView || {};
    if (!currentPoint || currentPoint < requiredPoints) {
      throw new Error(
        `Insufficient points in community wallet. Required: ${requiredPoints}, Available: ${currentPoint || 0}`,
      );
    }

    return { communityWallet, userWallet };
  },
};
