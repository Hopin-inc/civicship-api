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
import OpportunityPresenter from "@/application/opportunity/presenter";
import { PublishStatus, Role } from "@prisma/client";
import OpportunityService from "@/application/opportunity/service";

export default class OpportunityUseCase {
  static async anyoneBrowseOpportunities(
    { filter, sort, cursor, first }: GqlQueryOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    const currentUserId = ctx.currentUser?.id;
    const communityIds = ctx.hasPermissions?.memberships?.map((m) => m.communityId) || [];

    const { isManager, isMember } = checkMembershipRoles(ctx, communityIds, currentUserId);
    const allowedPublishStatuses = isManager
      ? Object.values(PublishStatus)
      : isMember
        ? [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL]
        : [PublishStatus.PUBLIC];

    await OpportunityService.validatePublishStatus(allowedPublishStatuses, filter);

    const validatedFilter: GqlOpportunityFilterInput = validateByPermissions(
      communityIds,
      isMember,
      isManager,
      currentUserId,
      filter,
    );

    return OpportunityService.fetchOpportunities(ctx, {
      cursor,
      sort,
      filter: validatedFilter,
      first,
    });
  }

  static async visitorViewOpportunity(
    { id, permission }: GqlQueryOpportunityArgs,
    ctx: IContext,
  ): Promise<GqlOpportunity | null> {
    const currentUserId = ctx.currentUser?.id;
    const { isManager, isMember } = checkMembershipRole(ctx, permission.communityId, currentUserId);

    const validatedFilter = validateByPermission(id, currentUserId, isMember, isManager);

    const record = await OpportunityService.findOpportunity(ctx, id, validatedFilter);
    return record ? OpportunityPresenter.get(record) : null;
  }

  static async managerCreateOpportunity(
    { input }: GqlMutationOpportunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityCreatePayload> {
    const res = await OpportunityService.createOpportunity(ctx, input);
    return OpportunityPresenter.create(res);
  }

  static async managerDeleteOpportunity(
    { id }: GqlMutationOpportunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityDeletePayload> {
    const res = await OpportunityService.deleteOpportunity(ctx, id);
    return OpportunityPresenter.delete(res);
  }

  static async managerUpdateOpportunityContent(
    { id, input }: GqlMutationOpportunityUpdateContentArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityUpdateContentPayload> {
    const res = await OpportunityService.updateOpportunityContent(ctx, id, input);
    return OpportunityPresenter.update(res);
  }

  static async managerSetOpportunityPublishStatus(
    { id, input }: GqlMutationOpportunitySetPublishStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySetPublishStatusPayload> {
    const res = await OpportunityService.setOpportunityStatus(ctx, id, input.status);
    return OpportunityPresenter.setPublishStatus(res);
  }
}

function validateByPermission(
  communityId: string,
  currentUserId?: string,
  isMember?: boolean,
  isManager?: boolean,
  filter?: GqlOpportunityFilterInput,
): GqlOpportunityFilterInput {
  const orConditions: GqlOpportunityFilterInput[] = [
    { publishStatus: [PublishStatus.PUBLIC] },
    ...(isMember ? [{ publishStatus: [PublishStatus.COMMUNITY_INTERNAL] }] : []),
    ...(currentUserId ? [{ createdByUserIds: [currentUserId] }] : []),
  ];

  return {
    and: [
      { communityIds: [communityId] },
      isManager ? {} : { or: orConditions },
      ...(filter ? [filter] : []),
    ].filter(Boolean),
  };
}

function validateByPermissions(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
  currentUserId?: string,
  filter?: GqlOpportunityFilterInput,
): GqlOpportunityFilterInput {
  const orConditions: GqlOpportunityFilterInput[] = [];

  communityIds.forEach((communityId) => {
    if (isManager[communityId]) {
      orConditions.push({ communityIds: [communityId] });
    } else {
      orConditions.push({
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
        ],
      });
    }
  });

  return filter ? { and: [{ or: orConditions }, filter] } : { or: orConditions };
}

function checkMembershipRole(
  ctx: IContext,
  communityId: string,
  currentUserId?: string,
): { isManager: boolean; isMember: boolean } {
  const isManager = Boolean(
    currentUserId &&
      ctx.hasPermissions?.memberships?.some(
        (m) => m.communityId === communityId && (m.role === Role.OWNER || m.role === Role.MANAGER),
      ),
  );

  const isMember = Boolean(
    currentUserId && ctx.hasPermissions?.memberships?.some((m) => m.communityId === communityId),
  );

  return { isManager, isMember };
}

function checkMembershipRoles(
  ctx: IContext,
  communityIds: string[],
  currentUserId?: string,
): { isManager: Record<string, boolean>; isMember: Record<string, boolean> } {
  if (!currentUserId || communityIds.length === 0) {
    return { isManager: {}, isMember: {} };
  }

  const userMemberships = ctx.hasPermissions?.memberships || [];

  const isManager: Record<string, boolean> = {};
  const isMember: Record<string, boolean> = {};

  communityIds.forEach((communityId) => {
    const membership = userMemberships.find((m) => m.communityId === communityId);

    if (membership) {
      isManager[communityId] = membership.role === Role.OWNER || membership.role === Role.MANAGER;
      isMember[communityId] = true;
    } else {
      isManager[communityId] = false;
      isMember[communityId] = false;
    }
  });

  return { isManager, isMember };
}
