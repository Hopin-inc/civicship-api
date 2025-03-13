import {
  GqlOpportunityCreateInput,
  GqlOpportunityUpdateContentInput,
  GqlQueryOpportunitiesArgs,
} from "@/types/graphql";
import OpportunityInputFormat from "@/application/opportunity/data/converter";
import OpportunityRepository from "@/application/opportunity/data/repository";
import { Prisma, PublishStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { getCurrentUserId } from "@/utils";

export default class OpportunityService {
  static async fetchPublicOpportunities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryOpportunitiesArgs,
    take: number,
  ) {
    const where = OpportunityInputFormat.filter(filter ?? {});
    const orderBy = OpportunityInputFormat.sort(sort ?? {});

    return await OpportunityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findOpportunity(ctx: IContext, id: string) {
    return await OpportunityRepository.find(ctx, id);
  }

  static async findOpportunityOrThrow(ctx: IContext, opportunityId: string) {
    const opportunity = await OpportunityRepository.find(ctx, opportunityId);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { opportunityId });
    }
    return opportunity;
  }

  static async createOpportunity(ctx: IContext, input: GqlOpportunityCreateInput) {
    const currentUserId = getCurrentUserId(ctx);

    validateCreateOpportunityPlaceInput(input);
    const data: Prisma.OpportunityCreateInput = OpportunityInputFormat.create(input, currentUserId);
    return await OpportunityRepository.create(ctx, data);
  }

  static async deleteOpportunity(ctx: IContext, id: string) {
    await this.findOpportunityOrThrow(ctx, id);

    return await OpportunityRepository.delete(ctx, id);
  }

  static async updateOpportunityContent(
    ctx: IContext,
    id: string,
    input: GqlOpportunityUpdateContentInput,
  ) {
    await this.findOpportunityOrThrow(ctx, id);
    validateUpdateOpportunityPlaceInput(input);

    const data: Prisma.OpportunityUpdateInput = OpportunityInputFormat.update(input);
    return await OpportunityRepository.update(ctx, id, data);
  }

  static async setOpportunityStatus(ctx: IContext, id: string, status: PublishStatus) {
    await this.findOpportunityOrThrow(ctx, id);

    return await OpportunityRepository.setStatus(ctx, id, status);
  }
}

function validateCreateOpportunityPlaceInput(input: GqlOpportunityCreateInput): void {
  if ((input.place.where && input.place.create) || (!input.place.where && !input.place.create)) {
    throw new ValidationError(`For Place, choose only one of "where" or "create."`, [
      JSON.stringify(input.place),
    ]);
  }
}

function validateUpdateOpportunityPlaceInput(input: GqlOpportunityUpdateContentInput): void {
  if (input.place) {
    if ((input.place.where && input.place.create) || (!input.place.where && !input.place.create)) {
      throw new ValidationError(`For Place, choose only one of "where" or "create."`, [
        JSON.stringify(input.place),
      ]);
    }
  }
}
