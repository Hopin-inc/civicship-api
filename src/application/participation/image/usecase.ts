import {
  GqlMutationParticipationImageBulkUpdateArgs,
  GqlParticipationImageBulkUpdateInput,
  GqlParticipationImageBulkUpdatePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationImageRepository from "@/application/participation/image/data/repository";
import ParticipationImageService from "@/application/participation/image/service";
import ParticipationService from "@/application/participation/service";
import ParticipationImagePresenter from "@/application/participation/image/presenter";
import { EvaluationStatus, ParticipationStatus, TransactionReason, Prisma } from "@prisma/client";
import TransactionService from "@/application/transaction/service";
import { getCurrentUserId } from "@/application/utils";
import { PrismaParticipation } from "@/application/participation/data/type";
import WalletValidator from "@/application/membership/wallet/validator";

export default class ParticipationImageUseCase {
  private static issuer = new PrismaClientIssuer();

  static async userBulkUpdateParticipationImages(
    { input }: GqlMutationParticipationImageBulkUpdateArgs,
    ctx: IContext,
  ): Promise<GqlParticipationImageBulkUpdatePayload> {
    const currentUserId = getCurrentUserId(ctx);

    const updatedParticipation = await this.issuer.public(ctx, async (tx) => {
      const participationBeforeUpdate = await ParticipationService.findParticipationOrThrow(
        ctx,
        input.participationId,
      );

      await applyParticipationImageMutations(ctx, input, tx);
      const participationAfterUpdate = await ParticipationService.findParticipationOrThrow(
        ctx,
        input.participationId,
      );

      if (shouldRewardForImageSubmission(participationBeforeUpdate, participationAfterUpdate)) {
        const {
          id: participationId,
          communityId,
          opportunitySlot,
          opportunityInvitationHistory,
        } = participationAfterUpdate;

        const pointsToEarn = opportunitySlot?.opportunity?.pointsToEarn ?? 0;
        const inviterId = opportunityInvitationHistory?.invitation?.createdBy;

        await transferRewardPointsToUser(
          ctx,
          tx,
          participationId,
          communityId!,
          currentUserId,
          pointsToEarn,
        );

        if (inviterId) {
          await transferRewardPointsToUser(
            ctx,
            tx,
            participationId,
            communityId!,
            inviterId,
            pointsToEarn,
          );
        }
      }

      return participationAfterUpdate;
    });

    return ParticipationImagePresenter.updateImages(updatedParticipation);
  }
}

async function applyParticipationImageMutations(
  ctx: IContext,
  input: GqlParticipationImageBulkUpdateInput,
  tx: Prisma.TransactionClient,
) {
  if (input.delete?.length) {
    await ParticipationImageRepository.deleteMany(ctx, input.delete, tx);
  }
  if (input.create?.length) {
    await ParticipationImageService.validateAndCreateImages(
      ctx,
      input.create,
      input.participationId,
      tx,
    );
  }
}

function shouldRewardForImageSubmission(
  before: PrismaParticipation,
  after: PrismaParticipation,
): boolean {
  return isFirstTimeImageSubmission(before, after) && isEligibleForPointReward(after);
}

function isFirstTimeImageSubmission(
  before: PrismaParticipation,
  after: PrismaParticipation,
): boolean {
  return before.images.length === 0 && after.images.length > 0;
}

function isEligibleForPointReward(after: PrismaParticipation): boolean {
  return (
    after.status === ParticipationStatus.PARTICIPATED &&
    after.evaluation?.status === EvaluationStatus.PASSED &&
    (after.opportunitySlot?.opportunity?.pointsToEarn ?? 0) > 0 &&
    !!after.communityId
  );
}

async function transferRewardPointsToUser(
  ctx: IContext,
  tx: Prisma.TransactionClient,
  participationId: string,
  communityId: string,
  userId: string,
  transferPoints: number,
) {
  const { fromWalletId, toWalletId } = await WalletValidator.validateCommunityMemberTransfer(
    ctx,
    tx,
    communityId,
    userId,
    transferPoints,
    TransactionReason.POINT_REWARD,
  );

  await TransactionService.giveRewardPoint(
    ctx,
    tx,
    participationId,
    transferPoints,
    fromWalletId,
    toWalletId,
  );
}
