import ParticipationStatusHistoryRepository from "@/domains/opportunity/participationStatusHistory/repository";
import { IContext } from "@/types/server";
import { ParticipationStatus, Prisma, WalletType } from "@prisma/client";
import { ParticipationPayloadWithArgs } from "@/domains/opportunity/participation/type";
import OpportunityRepository from "@/domains/opportunity/repository";
import TransactionService from "@/domains/transaction/service";
import ParticipationStatusHistoryInputFormat from "@/domains/opportunity/participationStatusHistory/presenter/input";
import {
  GqlParticipation,
  GqlParticipationFilterInput,
  GqlParticipationsConnection,
  GqlParticipationSortInput,
  GqlWallet,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import ParticipationRepository from "@/domains/opportunity/participation/repository";
import { clampFirst } from "@/graphql/pagination";
import ParticipationService from "@/domains/opportunity/participation/service";
import ParticipationOutputFormat from "@/domains/opportunity/participation/presenter/output";

export const ParticipationUtils = {
  async fetchParticipationsCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlParticipationFilterInput;
      sort?: GqlParticipationSortInput;
      first?: number;
    },
  ): Promise<GqlParticipationsConnection> {
    const take = clampFirst(first);

    const res = await ParticipationService.fetchParticipations(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data: GqlParticipation[] = res.slice(0, take).map((record) => {
      return ParticipationOutputFormat.get(record);
    });

    return ParticipationOutputFormat.query(data, hasNextPage);
  },

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
        await this.handlePointsTransfer(ctx, tx, participation);
      }

      await this.recordParticipationHistory(ctx, tx, id, status, currentUserId);

      return participation;
    });
  },

  async handlePointsTransfer(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participation: ParticipationPayloadWithArgs,
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

    if (!participation.userId) {
      throw new Error(`Participation with ID ${participation.userId} not found`);
    }

    const { communityWallet, userWallet } = this.validateTransfer(
      opportunity.community.wallets,
      participation.userId,
      opportunity.pointsPerParticipation,
    );

    await TransactionService.giveRewardPoint(ctx, tx, {
      from: communityWallet.id,
      fromPointChange: -opportunity.pointsPerParticipation,
      to: userWallet.id,
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
