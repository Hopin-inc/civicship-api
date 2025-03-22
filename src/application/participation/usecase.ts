import {
  GqlMutationParticipationCreatePersonalRecordArgs,
  GqlMutationParticipationDeletePersonalRecordArgs,
  GqlParticipation,
  GqlParticipationCreatePersonalRecordPayload,
  GqlParticipationDeletePayload,
  GqlParticipationsConnection,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationService from "@/application/participation/service";
import ParticipationPresenter from "@/application/participation/presenter";
import { getCurrentUserId, runOnboardingReward } from "@/application/utils";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationImageService from "@/application/participation/image/service";
import { maxOnboardingRecords, OnboardingTodoPoints } from "@/consts/utils";
import { Todo } from "@prisma/client";

export default class ParticipationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseParticipations(
    args: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationService.fetchParticipations(ctx, args);
  }

  static async visitorViewParticipation(
    { id }: GqlQueryParticipationArgs,
    ctx: IContext,
  ): Promise<GqlParticipation | null> {
    const res = await ParticipationService.findParticipation(ctx, id);
    if (!res) {
      return null;
    }
    return ParticipationPresenter.get(res);
  }

  static async userCreatePersonalParticipationRecord(
    { input }: GqlMutationParticipationCreatePersonalRecordArgs,
    ctx: IContext,
  ): Promise<GqlParticipationCreatePersonalRecordPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const participation = await this.issuer.public(ctx, async (tx) => {
      const participation = await ParticipationService.createParticipation(
        ctx,
        input,
        currentUserId,
        tx,
      );
      await ParticipationImageService.validateAndCreateImages(
        ctx,
        input.images,
        participation.id,
        tx,
      );

      const personalLogCount = await ParticipationService.countPersonalRecords(
        ctx,
        currentUserId,
        tx,
      );
      if (personalLogCount < maxOnboardingRecords) {
        await runOnboardingReward(
          ctx,
          currentUserId,
          Todo.PERSONAL_RECORD,
          OnboardingTodoPoints.PERSONAL_RECORD,
          tx,
          false,
        );
      } else if (personalLogCount === maxOnboardingRecords) {
        await runOnboardingReward(
          ctx,
          currentUserId,
          Todo.PERSONAL_RECORD,
          OnboardingTodoPoints.PERSONAL_RECORD,
          tx,
          true,
        );
      }

      return participation;
    });

    return ParticipationPresenter.create(participation);
  }

  static async userDeletePersonalParticipationRecord(
    { id }: GqlMutationParticipationDeletePersonalRecordArgs,
    ctx: IContext,
  ): Promise<GqlParticipationDeletePayload> {
    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);
    ParticipationService.validateDeletable(participation);

    const deleted = await ParticipationService.deleteParticipation(ctx, id);
    return ParticipationPresenter.delete(deleted);
  }
}
