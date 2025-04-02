import {
  GqlMutationParticipationImageBulkUpdateArgs,
  GqlParticipationImageBulkUpdateInput,
  GqlParticipationImageBulkUpdatePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationImageRepository from "@/application/domain/participation/image/data/repository";
import ParticipationImageService from "@/application/domain/participation/image/service";
import ParticipationService from "@/application/domain/participation/service";
import ParticipationImagePresenter from "@/application/domain/participation/image/presenter";
import { Prisma } from "@prisma/client";

export default class ParticipationImageUseCase {
  private static issuer = new PrismaClientIssuer();

  static async userBulkUpdateParticipationImages(
    { input }: GqlMutationParticipationImageBulkUpdateArgs,
    ctx: IContext,
  ): Promise<GqlParticipationImageBulkUpdatePayload> {
    await ParticipationService.findParticipationOrThrow(ctx, input.participationId);

    const updatedParticipation = await this.issuer.public(ctx, async (tx) => {
      await applyParticipationImageMutations(ctx, input, tx);
      return await ParticipationService.findParticipationOrThrow(ctx, input.participationId);
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
