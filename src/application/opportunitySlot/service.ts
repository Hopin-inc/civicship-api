import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotUpdateInput,
  GqlQueryOpportunitySlotsArgs,
} from "@/types/graphql";
import OpportunitySlotRepository from "@/application/opportunitySlot/data/repository";
import OpportunitySlotConverter from "@/application/opportunitySlot/data/converter";

export default class OpportunitySlotService {
  static async fetchOpportunitySlots(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryOpportunitySlotsArgs,
    take: number,
  ) {
    const where = OpportunitySlotConverter.filter(filter ?? {});
    const orderBy = OpportunitySlotConverter.sort(sort ?? {});
    return OpportunitySlotRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findOpportunitySlot(ctx: IContext, id: string) {
    return OpportunitySlotRepository.find(ctx, id);
  }

  static async fetchAllSlotByOpportunityId(
    ctx: IContext,
    opportunityId: string,
    tx: Prisma.TransactionClient,
  ) {
    return OpportunitySlotRepository.findByOpportunityId(ctx, opportunityId, tx);
  }

  static async bulkCreateOpportunitySlots(
    ctx: IContext,
    opportunityId: string,
    inputs: GqlOpportunitySlotCreateInput[],
    tx: Prisma.TransactionClient,
  ) {
    if (inputs.length === 0) return;

    const createData = inputs.map((input) => OpportunitySlotConverter.create(opportunityId, input));
    await OpportunitySlotRepository.createMany(ctx, createData, tx);
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
