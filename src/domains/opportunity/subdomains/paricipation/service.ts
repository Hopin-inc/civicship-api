import { GqlParticipationApplyInput, GqlQueryParticipationsArgs, GqlWallet } from "@/types/graphql";
import { ParticipationStatus, Prisma, WalletType } from "@prisma/client";
import ParticipationInputFormat from "@/domains/opportunity/subdomains/paricipation/presenter/input";
import ParticipationRepository from "@/domains/opportunity/subdomains/paricipation/repository";
import ParticipationStatusHistoryRepository from "@/domains/opportunity/subdomains/participationStatusHistory/repository";
import ParticipationStatusHistoryInputFormat from "@/domains/opportunity/subdomains/participationStatusHistory/presenter/input";
import { prismaClient } from "@/prisma/client";
import OpportunityRepository from "@/domains/opportunity/repository";
import { IContext } from "@/types/server";
import TransactionRepository from "@/domains/transaction/repository";

export default class ParticipationService {
  static async fetchParticipations(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryParticipationsArgs,
    take: number,
  ) {
    const where = ParticipationInputFormat.filter(filter ?? {});
    const orderBy = ParticipationInputFormat.sort(sort ?? {});

    return await ParticipationRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findParticipation(ctx: IContext, id: string) {
    return await ParticipationRepository.find(ctx, id);
  }

  static async applyParticipation(ctx: IContext, input: GqlParticipationApplyInput) {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) {
      throw new Error("Unauthorized: User must be logged in");
    }

    const data: Prisma.ParticipationCreateInput = ParticipationInputFormat.apply(
      input,
      currentUserId,
    );

    return await prismaClient.$transaction(async (tx) => {
      const opportunity = await OpportunityRepository.findWithTransaction(
        ctx,
        tx,
        input.opportunityId,
      );

      if (!opportunity) {
        throw new Error(`OpportunityNotFound: ID=${input.opportunityId}`);
      }

      const participationStatus = opportunity.requireApproval
        ? ParticipationStatus.APPLIED
        : ParticipationStatus.PARTICIPATING;

      const participation = await ParticipationRepository.createWithTransaction(ctx, tx, {
        ...data,
        status: participationStatus,
      });

      const history: Prisma.ParticipationStatusHistoryCreateInput =
        ParticipationStatusHistoryInputFormat.create({
          participationId: participation.id,
          status: participationStatus,
          createdById: currentUserId,
        });
      await ParticipationStatusHistoryRepository.createWithTransaction(ctx, tx, history);

      return participation;
    });
  }

  static async cancelApplication(ctx: IContext, id: string) {
    return this.setParticipationStatus(ctx, id, ParticipationStatus.CANCELED);
  }

  static async approveApplication(ctx: IContext, id: string) {
    return this.setParticipationStatus(ctx, id, ParticipationStatus.PARTICIPATING);
  }

  static async denyApplication(ctx: IContext, id: string) {
    return this.setParticipationStatus(ctx, id, ParticipationStatus.NOT_PARTICIPATING);
  }

  static async approvePerformance(ctx: IContext, id: string) {
    return this.setParticipationStatus(ctx, id, ParticipationStatus.APPROVED, true);
  }

  static async denyPerformance(ctx: IContext, id: string) {
    return this.setParticipationStatus(ctx, id, ParticipationStatus.DENIED);
  }

  private static async setParticipationStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    withPointsTransfer = false,
  ) {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) {
      throw new Error("Unauthorized: User must be logged in");
    }

    return await prismaClient.$transaction(async (tx) => {
      const participation = await ParticipationRepository.setStatusWithTransaction(
        ctx,
        tx,
        id,
        status,
      );

      if (withPointsTransfer && status === ParticipationStatus.APPROVED) {
        const opportunity = await OpportunityRepository.findWithTransaction(
          ctx,
          tx,
          participation.opportunityId,
        );

        if (!opportunity) {
          throw new Error(`Opportunity with ID ${participation.opportunityId} not found`);
        }

        const wallets: GqlWallet[] = opportunity.community.wallets;
        const communityWallet = wallets.find((wallet) => wallet.type === WalletType.COMMUNITY);
        const userWallet = wallets.find((wallet) => wallet.user?.id === currentUserId);

        const communityWalletId = communityWallet?.id;
        const userWalletId = userWallet?.id;

        if (!communityWalletId || !userWalletId) {
          throw new Error("Wallet information is missing for points transfer");
        }

        const { currentPoint } = communityWallet.currentPointView || {};
        if (!currentPoint || currentPoint < opportunity.pointsPerParticipation) {
          throw new Error(
            `Insufficient points in community wallet. Required: ${opportunity.pointsPerParticipation}, Available: ${currentPoint || 0}`,
          );
        }

        await TransactionRepository.transferPoints(
          tx,
          communityWalletId,
          userWalletId,
          opportunity.pointsPerParticipation,
        );
      }

      const history: Prisma.ParticipationStatusHistoryCreateInput =
        ParticipationStatusHistoryInputFormat.create({
          participationId: id,
          status,
          createdById: currentUserId,
        });
      await ParticipationStatusHistoryRepository.createWithTransaction(ctx, tx, history);

      return participation;
    });
  }
}
