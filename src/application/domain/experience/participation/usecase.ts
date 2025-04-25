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
import ParticipationService from "@/application/domain/experience/participation/service";
import ParticipationPresenter from "@/application/domain/experience/participation/presenter";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { participationInclude } from "@/application/domain/experience/participation/data/type";

export default class ParticipationUseCase {
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
    const participation = await ParticipationService.createParticipation(ctx, input, currentUserId);

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
