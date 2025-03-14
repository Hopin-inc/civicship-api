import {
  GqlOpportunitiesConnection,
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
  GqlOpportunityUpdateContentInput,
} from "@/types/graphql";
import OpportunityInputFormat from "@/application/opportunity/data/converter";
import OpportunityRepository from "@/application/opportunity/data/repository";
import { Prisma, PublishStatus, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import { AuthorizationError, NotFoundError, ValidationError } from "@/errors/graphql";
import { clampFirst, getCurrentUserId } from "@/utils";
import OpportunityPresenter from "@/application/opportunity/presenter";
import { PrismaOpportunity } from "@/application/opportunity/data/type";

export default class OpportunityService {
  static async fetchOpportunitiesConnection(
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

    const res = await OpportunityService.fetchPublicOpportunities(
      ctx,
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = res.length > take;

    const data = res.slice(0, take).map((record) => {
      return OpportunityPresenter.get(record);
    });
    return OpportunityPresenter.query(data, hasNextPage);
  }

  static async fetchPublicOpportunities(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
    }: {
      cursor?: string;
      filter?: GqlOpportunityFilterInput;
      sort?: GqlOpportunitySortInput;
    },
    take: number,
  ) {
    const where = OpportunityInputFormat.filter(filter ?? {});
    const orderBy = OpportunityInputFormat.sort(sort ?? {});

    return await OpportunityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findOpportunity(ctx: IContext, id: string) {
    const opportunity = await OpportunityRepository.find(ctx, id);
    if (!opportunity) {
      return null;
    }

    return await this.validateOpportunityAccess(ctx, opportunity);
  }

  static async findOpportunityOrThrow(ctx: IContext, opportunityId: string) {
    const opportunity = await OpportunityRepository.find(ctx, opportunityId);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { opportunityId });
    }
    return await this.validateOpportunityAccess(ctx, opportunity);
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

  static async validateOpportunityAccess(
    ctx: IContext,
    opportunity: PrismaOpportunity,
  ): Promise<PrismaOpportunity> {
    if (opportunity.publishStatus === PublishStatus.PUBLIC) {
      return opportunity;
    }

    if (opportunity.publishStatus === PublishStatus.COMMUNITY_INTERNAL) {
      return validateOpportunityCommunityInternalAccess(ctx, opportunity);
    }

    if (opportunity.publishStatus === PublishStatus.PRIVATE) {
      if (isOpportunityCreateByUser(ctx, opportunity.id)) {
        return opportunity;
      }
      isCommunityManager(ctx, opportunity.createdBy);
      return opportunity;
    }

    throw new AuthorizationError("Unauthorized access");
  }
}

function validateOpportunityCommunityInternalAccess(
  ctx: IContext,
  opportunity: PrismaOpportunity,
): PrismaOpportunity {
  const communityId = opportunity.communityId;
  const hasMembership =
    ctx.hasPermissions?.memberships.some((m) => m.communityId === communityId) ?? false;
  if (!hasMembership) {
    throw new AuthorizationError("User is not a member of the community");
  }
  return opportunity;
}

function isOpportunityCreateByUser(ctx: IContext, opportunityId: string): boolean {
  return ctx.hasPermissions?.opportunitiesCreatedByMe?.some((a) => a.id === opportunityId) ?? false;
}

function isCommunityManager(ctx: IContext, communityId: string): void {
  const membership = ctx.hasPermissions?.memberships?.find((m) => m.communityId === communityId);
  if (!(membership?.role === Role.OWNER || membership?.role === Role.MANAGER)) {
    throw new AuthorizationError("User must be community manager");
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
