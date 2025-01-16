import {
  GqlOpportunityCreateInput,
  GqlOpportunityEditContentInput,
  GqlQueryOpportunitiesArgs,
} from "@/types/graphql";
import OpportunityInputFormat from "@/domains/opportunity/presenter/input";
import OpportunityRepository from "@/domains/opportunity/repository";
import { Prisma, PublishStatus } from "@prisma/client";
import { IContext } from "@/types/server";

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
      throw new Error("Unauthorized: User must be logged in");
    }

    const data: Prisma.OpportunityCreateInput = OpportunityInputFormat.create(input, currentUserId);
    return await OpportunityRepository.create(ctx, data);
  }

  static async deleteOpportunity(ctx: IContext, id: string) {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) {
      throw new Error("Unauthorized: User must be logged in");
    }

    const opportunity = await OpportunityRepository.find(ctx, id);
    if (!opportunity) {
      throw new Error(`OpportunityNotFound: ID=${id}`);
    }

    return await OpportunityRepository.delete(ctx, id);
  }

  static async editOpportunityContent(
    ctx: IContext,
    id: string,
    input: GqlOpportunityEditContentInput,
  ) {
    const opportunity = await OpportunityRepository.find(ctx, id);
    if (!opportunity) {
      throw new Error(`OpportunityNotFound: ID=${id}`);
    }

    const data: Prisma.OpportunityUpdateInput = OpportunityInputFormat.update(input);
    return await OpportunityRepository.update(ctx, id, data);
  }

  static async setOpportunityStatus(ctx: IContext, id: string, status: PublishStatus) {
    const opportunity = await OpportunityRepository.find(ctx, id);
    if (!opportunity) {
      throw new Error(`OpportunityNotFound: ID=${id}`);
    }

    return await OpportunityRepository.setStatus(ctx, id, status);
  }
}
