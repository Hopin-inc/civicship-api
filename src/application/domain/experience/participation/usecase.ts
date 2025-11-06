import {
  GqlMutationParticipationBulkCreateArgs,
  GqlMutationParticipationCreatePersonalRecordArgs,
  GqlMutationParticipationDeletePersonalRecordArgs,
  GqlParticipation,
  GqlParticipationBulkCreatePayload,
  GqlParticipationCreatePersonalRecordPayload,
  GqlParticipationDeletePayload,
  GqlParticipationsConnection,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationPresenter from "@/application/domain/experience/participation/presenter";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { participationInclude } from "@/application/domain/experience/participation/data/type";
import { inject, injectable } from "tsyringe";
import { IParticipationService } from "@/application/domain/experience/participation/data/interface";
import OpportunitySlotService from "@/application/domain/experience/opportunitySlot/service";

@injectable()
export default class ParticipationUseCase {
  constructor(
    @inject("ParticipationService") private readonly service: IParticipationService,
    @inject("OpportunitySlotService") private slotService: OpportunitySlotService,
  ) {}

  async visitorBrowseParticipations(
    { filter, first, sort, cursor }: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    const take = clampFirst(first);

    const records = await this.service.fetchParticipations(
      ctx,
      { filter, sort, cursor },
      take,
      participationInclude,
    );

    const hasNextPage = records.length > take;
    const data: GqlParticipation[] = records
      .slice(0, take)
      .map((record) => ParticipationPresenter.get(record));
    return ParticipationPresenter.query(data, hasNextPage, cursor);
  }

  async visitorViewParticipation(
    { id }: GqlQueryParticipationArgs,
    ctx: IContext,
  ): Promise<GqlParticipation | null> {
    const res = await this.service.findParticipation(ctx, id);
    if (!res) {
      return null;
    }
    return ParticipationPresenter.get(res);
  }

  async managerBulkCreateParticipations(
    { input }: GqlMutationParticipationBulkCreateArgs,
    ctx: IContext,
  ): Promise<GqlParticipationBulkCreatePayload> {
    await this.slotService.findOpportunitySlotOrThrow(ctx, input.slotId);

    const created = await ctx.issuer.public(ctx, async (tx) => {
      return await this.service.bulkCreateParticipations(ctx, input, tx);
    });

    return ParticipationPresenter.bulkCreate(created);
  }

  async userCreatePersonalParticipationRecord(
    { input }: GqlMutationParticipationCreatePersonalRecordArgs,
    ctx: IContext,
  ): Promise<GqlParticipationCreatePersonalRecordPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const participation = await ctx.issuer.public(ctx, async (tx) => {
      return await this.service.createParticipation(ctx, input, currentUserId, tx);
    });

    return ParticipationPresenter.create(participation);
  }

  async userDeletePersonalParticipationRecord(
    { id }: GqlMutationParticipationDeletePersonalRecordArgs,
    ctx: IContext,
  ): Promise<GqlParticipationDeletePayload> {
    const deleted = await ctx.issuer.public(ctx, async (tx) => {
      const participation = await this.service.findParticipationOrThrow(ctx, id, tx);
      this.service.validateDeletable(participation);

      return await this.service.deleteParticipation(ctx, id, tx);
    });

    return ParticipationPresenter.delete(deleted);
  }
}
