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
import ParticipationService from "@/application/domain/participation/service";
import ParticipationPresenter from "@/application/domain/participation/presenter";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationImageService from "@/application/domain/participation/image/service";
import { participationInclude } from "@/application/domain/participation/data/type";

export default class ParticipationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseParticipations(
    { filter, first, sort, cursor }: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    const take = clampFirst(first);

    const records = await ParticipationService.fetchParticipations(
      ctx,
      { filter, sort, cursor },
      take,
      participationInclude,
    );

    const hasNextPage = records.length > take;
    const data: GqlParticipation[] = records
      .slice(0, take)
      .map((record) => ParticipationPresenter.get(record));
    return ParticipationPresenter.query(data, hasNextPage);
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
