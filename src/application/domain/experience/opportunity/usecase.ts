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
import { PublishStatus } from "@prisma/client";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import { clampFirst, getMembershipRolesByCtx } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";

@injectable()
export default class OpportunityUseCase {
  constructor(@inject("OpportunityService") private readonly service: OpportunityService) {}

  async anyoneBrowseOpportunities(
    { filter, sort, cursor, first }: GqlQueryOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    const take = clampFirst(first);

    const currentUserId = ctx.currentUser?.id;
    const communityIds = ctx.hasPermissions?.memberships?.map((m) => m.communityId) || [];

    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);
    const allowedStatuses = getAllowedPublishStatuses(communityIds, isManager, isMember);

    await this.service.validatePublishStatus(allowedStatuses, filter);

    const accessFilter = enforceAccessFilter(currentUserId, communityIds);
    const finalFilter = accessFilter ? { and: [accessFilter, filter ?? {}] } : (filter ?? {});

    const records = await this.service.fetchOpportunities(
      ctx,
      {
        cursor,
        sort,
        filter: finalFilter,
      },
      take,
    );

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => OpportunityPresenter.get(record));

    return OpportunityPresenter.query(data, hasNextPage, cursor);
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
    { input, permission }: GqlMutationOpportunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityCreatePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.createOpportunity(ctx, input, permission.communityId, tx);
      return OpportunityPresenter.create(record);
    });
  }

  async managerDeleteOpportunity(
    { id }: GqlMutationOpportunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityDeletePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.deleteOpportunity(ctx, id, tx);
      return OpportunityPresenter.delete(record);
    });
  }

  async managerUpdateOpportunityContent(
    { id, input }: GqlMutationOpportunityUpdateContentArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityUpdateContentPayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.updateOpportunityContent(ctx, id, input, tx);
      return OpportunityPresenter.update(record);
    });
  }

  async managerSetOpportunityPublishStatus(
    { id, input }: GqlMutationOpportunitySetPublishStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySetPublishStatusPayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.setOpportunityPublishStatus(
        ctx,
        id,
        input.publishStatus,
        tx,
      );
      return OpportunityPresenter.setPublishStatus(record);
    });
  }
}

function getAllowedPublishStatuses(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
): PublishStatus[] {
  if (communityIds.some((id) => isManager[id])) {
    return Object.values(PublishStatus);
  }
  if (communityIds.some((id) => isMember[id])) {
    return [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
  }
  return [PublishStatus.PUBLIC];
}

function enforceAccessFilter(
  currentUserId: string | undefined,
  communityIds: string[],
): GqlOpportunityFilterInput | undefined {
  if (communityIds.length === 0) return undefined;

  return {
    or: communityIds.map((communityId) => ({
      communityIds: [communityId],
    })),
  };
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
