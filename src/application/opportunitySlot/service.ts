import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotFilterInput,
  GqlOpportunitySlotsConnection,
  GqlOpportunitySlotSortInput,
  GqlOpportunitySlotUpdateInput,
} from "@/types/graphql";
import OpportunitySlotRepository from "@/application/opportunitySlot/data/repository";
import OpportunitySlotConverter from "@/application/opportunitySlot/data/converter";
import { clampFirst } from "@/application/utils";
import OpportunitySlotPresenter from "@/application/opportunitySlot/presenter";
import { NotFoundError } from "@/errors/graphql";

export default class OpportunitySlotService {
  static async fetchOpportunitySlots(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlOpportunitySlotFilterInput;
      sort?: GqlOpportunitySlotSortInput;
      first?: number;
    },
  ): Promise<GqlOpportunitySlotsConnection> {
    const take = clampFirst(first);

    const where = OpportunitySlotConverter.filter(filter ?? {});
    const orderBy = OpportunitySlotConverter.sort(sort ?? {});

    const res = await OpportunitySlotRepository.query(ctx, where, orderBy, take, cursor);

    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => OpportunitySlotPresenter.get(record));

    return OpportunitySlotPresenter.query(data, hasNextPage);
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
