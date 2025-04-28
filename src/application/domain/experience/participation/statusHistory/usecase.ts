import { inject, injectable } from "tsyringe";
import {
  GqlParticipation,
  GqlParticipationStatusHistoriesArgs,
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
  GqlQueryParticipationStatusHistoriesArgs,
  GqlQueryParticipationStatusHistoryArgs,
  GqlUser,
  GqlUserParticipationStatusChangedByMeArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationStatusHistoryOutputFormat from "@/application/domain/experience/participation/statusHistory/presenter";
import ParticipationStatusHistoryService from "@/application/domain/experience/participation/statusHistory/service";

@injectable()
export default class ParticipationStatusHistoryUseCase {
  constructor(
    @inject("ParticipationStatusHistoryService")
    private readonly service: ParticipationStatusHistoryService,
  ) {}

  async visitorBrowseParticipationStatusHistories(
    { cursor, filter, sort, first }: GqlQueryParticipationStatusHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    return this.service.fetchParticipationStatusHistories(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  async visitorBrowseStatusHistoriesByParticipation(
    { id }: GqlParticipation,
    { first, cursor }: GqlParticipationStatusHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    return this.service.fetchParticipationStatusHistories(ctx, {
      cursor,
      filter: { participationId: id },
      first,
    });
  }

  async visitorBrowseParticipationStatusChangedByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserParticipationStatusChangedByMeArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    return this.service.fetchParticipationStatusHistories(ctx, {
      cursor,
      filter: { createdById: id },
      first,
    });
  }

  async visitorViewParticipationStatusHistory(
    { id }: GqlQueryParticipationStatusHistoryArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistory | null> {
    const res = await this.service.findParticipationStatusHistory(ctx, id);
    if (!res) {
      return null;
    }
    return ParticipationStatusHistoryOutputFormat.get(res);
  }
}
