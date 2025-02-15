import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotUpdateInput,
  GqlQueryOpportunitySlotsArgs,
} from "@/types/graphql";
import OpportunitySlotRepository from "@/domains/opportunity/slot/repository";
import OpportunitySlotInputFormat from "@/domains/opportunity/slot/presenter/input";

export default class OpportunitySlotService {
  static async fetchOpportunitySlots(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryOpportunitySlotsArgs,
    take: number,
  ) {
    const where = OpportunitySlotInputFormat.filter(filter ?? {});
    const orderBy = OpportunitySlotInputFormat.sort(sort ?? {});
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

  static async createOpportunitySlot(
    ctx: IContext,
    opportunityId: string,
    input: GqlOpportunitySlotCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const data = OpportunitySlotInputFormat.create(opportunityId, input);
    return OpportunitySlotRepository.create(ctx, data, tx);
  }

  static async updateOpportunitySlot(
    ctx: IContext,
    id: string,
    input: GqlOpportunitySlotUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    const data = OpportunitySlotInputFormat.update(input);
    return OpportunitySlotRepository.update(ctx, id, data, tx);
  }

  static async deleteOpportunitySlot(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return OpportunitySlotRepository.delete(ctx, id, tx);
  }
}
