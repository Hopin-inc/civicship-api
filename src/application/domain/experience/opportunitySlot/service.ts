import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotFilterInput,
  GqlOpportunitySlotSetHostingStatusInput,
  GqlOpportunitySlotSortInput,
  GqlOpportunitySlotUpdateInput,
  GqlQueryOpportunitySlotsArgs,
} from "@/types/graphql";
import OpportunitySlotRepository from "@/application/domain/experience/opportunitySlot/data/repository";
import OpportunitySlotConverter from "@/application/domain/experience/opportunitySlot/data/converter";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";

@injectable()
export default class OpportunitySlotService {
  constructor(
    @inject("OpportunitySlotRepository") private readonly repository: OpportunitySlotRepository,
    @inject("OpportunitySlotConverter") private readonly converter: OpportunitySlotConverter,
  ) {}

  async fetchOpportunitySlots(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryOpportunitySlotsArgs,
    take: number,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return await this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async fetchAllSlotByOpportunityId(
    ctx: IContext,
    filter: GqlOpportunitySlotFilterInput,
    sort?: GqlOpportunitySlotSortInput,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return this.repository.queryByOpportunityId(ctx, where, orderBy);
  }

  async findOpportunitySlot(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async findOpportunitySlotOrThrow(ctx: IContext, id: string) {
    const record = await this.repository.find(ctx, id);

    if (!record) {
      throw new NotFoundError("OpportunitySlot not found", { id });
    }

    return record;
  }

  async createOpportunitySlot(
    ctx: IContext,
    opportunityId: string,
    input: GqlOpportunitySlotCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const data = this.converter.create(opportunityId, input);
    return this.repository.create(ctx, data, tx);
  }

  async setOpportunitySlotHostingStatus(
    ctx: IContext,
    slotId: string,
    input: GqlOpportunitySlotSetHostingStatusInput,
    tx: Prisma.TransactionClient,
  ) {
    await this.findOpportunitySlotOrThrow(ctx, slotId);
    const data = this.converter.setStatus(input);
    return await this.repository.setHostingStatus(ctx, slotId, data, tx);
  }

  async bulkCreateOpportunitySlots(
    ctx: IContext,
    opportunityId: string,
    inputs: GqlOpportunitySlotCreateInput[],
    tx: Prisma.TransactionClient,
  ) {
    if (inputs.length === 0) return;

    const data = this.converter.createMany(opportunityId, inputs);
    return this.repository.createMany(ctx, data, tx);
  }

  async bulkUpdateOpportunitySlots(
    ctx: IContext,
    inputs: GqlOpportunitySlotUpdateInput[],
    tx: Prisma.TransactionClient,
  ) {
    if (inputs.length === 0) return;

    return await Promise.all(
      inputs.map((input) =>
        this.repository.update(ctx, input.id, this.converter.update(input), tx),
      ),
    );
  }

  async bulkDeleteOpportunitySlots(ctx: IContext, ids: string[], tx: Prisma.TransactionClient) {
    if (ids.length === 0) return;
    return await this.repository.deleteMany(ctx, ids, tx);
  }

  /**
   * Get the total number of participants for a slot
   */
  async getParticipantsCount(ctx: IContext, slotId: string): Promise<number> {
    const reservations = await ctx.loaders.reservationByOpportunitySlot.load(slotId);
    const participations = reservations.flatMap((reservation) => reservation.participations || []);
    return participations.length;
  }

  /**
   * Get the number of evaluated participants for a slot
   */
  async getEvaluatedParticipantsCount(ctx: IContext, slotId: string): Promise<number> {
    const reservations = await ctx.loaders.reservationByOpportunitySlot.load(slotId);
    const participations = reservations.flatMap((reservation) => reservation.participations || []);
    return participations.filter(
      (participation) =>
        participation.evaluation &&
        (participation.evaluation.status === "PASSED" ||
          participation.evaluation.status === "FAILED"),
    ).length;
  }

  /**
   * Check if all participants of a slot have been evaluated
   */
  async isSlotFullyEvaluated(ctx: IContext, slotId: string): Promise<boolean> {
    const reservations = await ctx.loaders.reservationByOpportunitySlot.load(slotId);
    const participations = reservations.flatMap((reservation) => reservation.participations || []);

    if (participations.length === 0) return true; // If no participants, consider it fully evaluated

    return participations.every(
      (participation) =>
        participation.evaluation &&
        (participation.evaluation.status === "PASSED" ||
          participation.evaluation.status === "FAILED"),
    );
  }
}
