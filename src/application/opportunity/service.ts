import {
  GqlNestedPlaceConnectOrCreateInput,
  GqlOpportunitiesConnection,
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
  GqlOpportunityUpdateContentInput,
} from "@/types/graphql";
import OpportunityRepository from "@/application/opportunity/data/repository";
import { OpportunityHostingStatus, Prisma, PublishStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { clampFirst, getCurrentUserId } from "@/application/utils";
import OpportunityPresenter from "@/application/opportunity/presenter";
import OpportunityConverter from "@/application/opportunity/data/converter";

export default class OpportunityService {
  static async fetchOpportunities(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlOpportunityFilterInput;
      sort?: GqlOpportunitySortInput;
      first?: number;
    },
  ): Promise<GqlOpportunitiesConnection> {
    const take = clampFirst(first);

    const where = OpportunityConverter.filter(filter ?? {});
    const orderBy = OpportunityConverter.sort(sort ?? {});

    const res = await OpportunityRepository.query(ctx, where, orderBy, take, cursor);

    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => OpportunityPresenter.get(record));

    return OpportunityPresenter.query(data, hasNextPage);
  }

  static async findOpportunity(ctx: IContext, id: string, filter: GqlOpportunityFilterInput) {
    const where = OpportunityConverter.findAccessible(id, filter ?? {});

    const opportunity = await OpportunityRepository.findAccessible(ctx, where);
    if (!opportunity) {
      return null;
    }

    return opportunity;
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

    validatePlaceInput(input.place);
    const data: Prisma.OpportunityCreateInput = OpportunityConverter.create(input, currentUserId);
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
    validatePlaceInput(input.place);

    const data: Prisma.OpportunityUpdateInput = OpportunityConverter.update(input);
    return await OpportunityRepository.update(ctx, id, data);
  }

  static async setOpportunityPublishStatus(ctx: IContext, id: string, status: PublishStatus) {
    await this.findOpportunityOrThrow(ctx, id);

    return await OpportunityRepository.setPublishStatus(ctx, id, status);
  }

  static async setOpportunityHostingStatus(
    ctx: IContext,
    id: string,
    status: OpportunityHostingStatus,
  ) {
    await this.findOpportunityOrThrow(ctx, id);

    return await OpportunityRepository.setHostingStatus(ctx, id, status);
  }

  static async validatePublishStatus(
    allowedStatuses: PublishStatus[],
    filter?: GqlOpportunityFilterInput,
  ) {
    if (
      filter?.publishStatus &&
      !filter.publishStatus.every((status) => allowedStatuses.includes(status))
    ) {
      throw new ValidationError(
        `Validation error: publishStatus must be one of ${allowedStatuses.join(", ")}`,
        [JSON.stringify(filter?.publishStatus)],
      );
    }
  }
}

function validatePlaceInput(place?: GqlNestedPlaceConnectOrCreateInput): void {
  if (place) {
    if ((place.where && place.create) || (!place.where && !place.create)) {
      throw new ValidationError(`For Place, choose only one of "where" or "create."`, [
        JSON.stringify(place),
      ]);
    }
  }
}
