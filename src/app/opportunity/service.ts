import {
  GqlOpportunityCreateInput,
  GqlOpportunityUpdateContentInput,
  GqlQueryOpportunitiesArgs,
} from "@/types/graphql";
import OpportunityInputFormat from "@/presentation/graphql/dto/opportunity/input";
import OpportunityRepository from "@/infra/repositories/opportunity";
import { Prisma, PublishStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { AuthorizationError, NotFoundError } from "@/errors/graphql";

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

  static async createOpportunity(ctx: IContext, input: GqlOpportunityCreateInput) {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) {
      throw new AuthorizationError("User must be logged in");
    }

    const data: Prisma.OpportunityCreateInput = OpportunityInputFormat.create(input, currentUserId);
    return await OpportunityRepository.create(ctx, data);
  }

  static async deleteOpportunity(ctx: IContext, id: string) {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) {
      throw new AuthorizationError("User must be logged in");
    }

    const opportunity = await OpportunityRepository.find(ctx, id);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { id });
    }

    return await OpportunityRepository.delete(ctx, id);
  }

  static async updateOpportunityContent(
    ctx: IContext,
    id: string,
    input: GqlOpportunityUpdateContentInput,
  ) {
    const opportunity = await OpportunityRepository.find(ctx, id);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { id });
    }

    const data: Prisma.OpportunityUpdateInput = OpportunityInputFormat.update(input);
    return await OpportunityRepository.update(ctx, id, data);
  }

  static async setOpportunityStatus(ctx: IContext, id: string, status: PublishStatus) {
    const opportunity = await OpportunityRepository.find(ctx, id);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { id });
    }

    return await OpportunityRepository.setStatus(ctx, id, status);
  }
}
