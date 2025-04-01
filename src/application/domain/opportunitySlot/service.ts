import { IContext } from "@/types/server";
import { OpportunitySlotHostingStatus, Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotUpdateInput,
  GqlQueryOpportunitySlotsArgs,
} from "@/types/graphql";
import OpportunitySlotRepository from "@/application/domain/opportunitySlot/data/repository";
import OpportunitySlotConverter from "@/application/domain/opportunitySlot/data/converter";
import { NotFoundError } from "@/errors/graphql";

export default class OpportunitySlotService {
  static async fetchOpportunitySlots(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryOpportunitySlotsArgs,
    take: number,
  ) {
    const where = OpportunitySlotConverter.filter(filter ?? {});
    const orderBy = OpportunitySlotConverter.sort(sort ?? {});

    return await OpportunitySlotRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findOpportunitySlot(ctx: IContext, id: string) {
    return OpportunitySlotRepository.find(ctx, id);
  }

  static async findOpportunitySlotOrThrow(ctx: IContext, id: string) {
    const record = await OpportunitySlotRepository.find(ctx, id);

    if (!record) {
      throw new NotFoundError("OpportunitySlot not found", { id });
    }

    return record;
  }

  static async fetchAllSlotByOpportunityId(
    ctx: IContext,
    opportunityId: string,
    tx: Prisma.TransactionClient,
  ) {
    return OpportunitySlotRepository.findByOpportunityId(ctx, opportunityId, tx);
  }

  static async setOpportunitySlotHostingStatus(
    ctx: IContext,
    slotId: string,
    hostingStatus: OpportunitySlotHostingStatus,
    tx: Prisma.TransactionClient,
  ) {
    await this.findOpportunitySlotOrThrow(ctx, slotId);
    return await OpportunitySlotRepository.setHostingStatus(ctx, slotId, hostingStatus, tx);
  }

  static async bulkCreateOpportunitySlots(
    ctx: IContext,
    opportunityId: string,
    inputs: GqlOpportunitySlotCreateInput[],
    tx: Prisma.TransactionClient,
  ) {
    if (inputs.length === 0) return;

    const data = OpportunitySlotConverter.createMany(opportunityId, inputs);
    await OpportunitySlotRepository.createMany(ctx, data, tx);
  }

  static async bulkUpdateOpportunitySlots(
    ctx: IContext,
    inputs: GqlOpportunitySlotUpdateInput[],
    tx: Prisma.TransactionClient,
  ) {
    if (inputs.length === 0) return;

    await Promise.all(
      inputs.map((input) =>
        OpportunitySlotRepository.update(ctx, input.id, OpportunitySlotConverter.update(input), tx),
      ),
    );
  }

  static async bulkDeleteOpportunitySlots(
    ctx: IContext,
    ids: string[],
    tx: Prisma.TransactionClient,
  ) {
    if (ids.length === 0) return;

    await OpportunitySlotRepository.deleteMany(ctx, ids, tx);
  }
}
