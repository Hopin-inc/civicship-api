import { IContext } from "@/types/server";
import { OpportunitySlotHostingStatus, Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotFilterInput,
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

  async findOpportunitySlotOrThrow(ctx: IContext, id: string) {
    const record = await this.repository.find(ctx, id);

    if (!record) {
      throw new NotFoundError("OpportunitySlot not found", { id });
    }

    return record;
  }

  async setOpportunitySlotHostingStatus(
    ctx: IContext,
    slotId: string,
    hostingStatus: OpportunitySlotHostingStatus,
    tx: Prisma.TransactionClient,
  ) {
    await this.findOpportunitySlotOrThrow(ctx, slotId);
    return await this.repository.setHostingStatus(ctx, slotId, hostingStatus, tx);
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
}
