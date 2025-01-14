import {
  GqlOpportunityCreateInput,
  GqlOpportunityEditContentInput,
  GqlQueryOpportunitiesArgs,
} from "@/types/graphql";
import OpportunityInputFormat from "@/domains/opportunity/presenter/input";
import OpportunityRepository from "@/domains/opportunity/repository";
import { Prisma, PublishStatus } from "@prisma/client";

export default class OpportunityService {
  static async fetchPublicOpportunities(
    { cursor, filter, sort }: GqlQueryOpportunitiesArgs,
    take: number,
  ) {
    const where = OpportunityInputFormat.filter(filter ?? {});
    const orderBy = OpportunityInputFormat.sort(sort ?? {});

    return await OpportunityRepository.query(where, orderBy, take, cursor);
  }

  static async findOpportunity(id: string) {
    return await OpportunityRepository.find(id);
  }

  static async createOpportunity(input: GqlOpportunityCreateInput) {
    const data: Prisma.OpportunityCreateInput = OpportunityInputFormat.create(input);
    return await OpportunityRepository.create(data);
  }

  static async deleteOpportunity(id: string) {
    const opportunity = await OpportunityRepository.find(id);
    if (!opportunity) {
      throw new Error(`OpportunityNotFound: ID=${id}`);
    }

    return await OpportunityRepository.delete(id);
  }

  static async editOpportunityContent(id: string, input: GqlOpportunityEditContentInput) {
    const opportunity = await OpportunityRepository.find(id);
    if (!opportunity) {
      throw new Error(`OpportunityNotFound: ID=${id}`);
    }

    const updateData: Prisma.OpportunityUpdateInput = OpportunityInputFormat.editContent(input);
    return await OpportunityRepository.update(id, updateData);
  }

  static async setOpportunityStatus(id: string, status: PublishStatus) {
    const opportunity = await OpportunityRepository.find(id);
    if (!opportunity) {
      throw new Error(`OpportunityNotFound: ID=${id}`);
    }

    return await OpportunityRepository.update(id, { publishStatus: status });
  }
}
