import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreatePayload,
  GqlOpportunityDeletePayload,
  GqlOpportunityFilterInput,
  GqlOpportunitySetPublishStatusPayload,
  GqlOpportunityUpdateContentPayload,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityPresenter from "@/application/domain/experience/opportunity/presenter";
import { PublishStatus, TicketStatus } from "@prisma/client";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import { clampFirst, getMembershipRolesByCtx } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

@injectable()
export default class OpportunityUseCase {
  constructor(
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
    @inject("OpportunityService") private readonly service: OpportunityService,
  ) {}

  async anyoneBrowseOpportunities(
    { filter, sort, cursor, first }: GqlQueryOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    const take = clampFirst(first);

    const currentUserId = ctx.currentUser?.id;
    const communityIds = ctx.hasPermissions?.memberships?.map((m) => m.communityId) || [];

    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);
    const allowedPublishStatuses = isManager
      ? Object.values(PublishStatus)
      : isMember
        ? [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL]
        : [PublishStatus.PUBLIC];

    await this.service.validatePublishStatus(allowedPublishStatuses, filter);

    const validatedFilter: GqlOpportunityFilterInput = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
      filter,
    );

    const records = await this.service.fetchOpportunities(
      ctx,
      {
        cursor,
        sort,
        filter: validatedFilter,
      },
      take,
    );

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => OpportunityPresenter.get(record));

    return OpportunityPresenter.query(data, hasNextPage);
  }

  async visitorViewOpportunity(
    { id, permission }: GqlQueryOpportunityArgs,
    ctx: IContext,
  ): Promise<GqlOpportunity | null> {
    const currentUserId = ctx.currentUser?.id;
    const communityIds = [permission.communityId];
    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);

    const validatedFilter = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
    );

    const record = await this.service.findOpportunityAccessible(ctx, id, validatedFilter);
    return record ? OpportunityPresenter.get(record) : null;
  }

  async managerCreateOpportunity(
    { input }: GqlMutationOpportunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityCreatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const record = await this.service.createOpportunity(ctx, input, tx);
      return OpportunityPresenter.create(record);
    });
  }

  async managerDeleteOpportunity(
    { id }: GqlMutationOpportunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityDeletePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const record = await this.service.deleteOpportunity(ctx, id, tx);
      return OpportunityPresenter.delete(record);
    });
  }

  async managerUpdateOpportunityContent(
    { id, input }: GqlMutationOpportunityUpdateContentArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityUpdateContentPayload> {
    return this.issuer.public(ctx, async (tx) => {
      const record = await this.service.updateOpportunityContent(ctx, id, input, tx);
      return OpportunityPresenter.update(record);
    });
  }

  async managerSetOpportunityPublishStatus(
    { id, input }: GqlMutationOpportunitySetPublishStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySetPublishStatusPayload> {
    return this.issuer.public(ctx, async (tx) => {
      const record = await this.service.setOpportunityPublishStatus(
        ctx,
        id,
        input.publishStatus,
        tx,
      );
      return OpportunityPresenter.setPublishStatus(record);
    });
  }

  async checkUserHasValidTicketForOpportunity(
    ctx: IContext,
    opportunityId: string,
  ): Promise<boolean> {
    if (!ctx.currentUser) return false;

    const opportunity = await ctx.loaders.opportunity.load(opportunityId);
    if (!opportunity) return false;

    const requiredUtilityIds = opportunity.requiredUtilities?.map((u) => u.id) ?? [];
    if (requiredUtilityIds.length === 0) return false;

    const userTickets =
      ctx.hasPermissions?.participations?.flatMap(
        (participation) =>
          participation.ticketStatusHistories
            ?.map((h) => h.ticket)
            .filter(
              (ticket) => ticket.status === TicketStatus.AVAILABLE && ticket.utilityId != null,
            ) ?? [],
      ) ?? [];

    const utilityIdSet = new Set(userTickets.map((t) => t.utilityId));
    return requiredUtilityIds.some((id) => utilityIdSet.has(id));
  }
}

function validateByMembershipRoles(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
  currentUserId?: string,
  filter?: GqlOpportunityFilterInput,
): GqlOpportunityFilterInput {
  if (communityIds.length === 0) {
    return {
      and: [{ publishStatus: [PublishStatus.PUBLIC] }, ...(filter ? [filter] : [])],
    };
  }

  const orConditions: GqlOpportunityFilterInput[] = communityIds.map((communityId) => {
    if (isManager[communityId]) {
      return {
        and: [{ communityIds: [communityId] }, ...(filter ? [filter] : [])],
      };
    }
    return {
      and: [
        { communityIds: [communityId] },
        {
          or: [
            { publishStatus: [PublishStatus.PUBLIC] },
            ...(isMember[communityId]
              ? [{ publishStatus: [PublishStatus.COMMUNITY_INTERNAL] }]
              : []),
            ...(currentUserId ? [{ createdByUserIds: [currentUserId] }] : []),
          ],
        },
        ...(filter ? [filter] : []),
      ],
    };
  });

  return { or: orConditions };
}
