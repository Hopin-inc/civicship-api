import {
  GqlCommunity,
  GqlCommunityOpportunitiesArgs,
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
  GqlPlace,
  GqlPlaceOpportunitiesArgs,
  GqlQueryOpportunitiesAllArgs,
  GqlQueryOpportunitiesCommunityInternalArgs,
  GqlQueryOpportunitiesPublicArgs,
  GqlQueryOpportunityArgs,
  GqlUser,
  GqlUserOpportunitiesCreatedByMeArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityPresenter from "@/application/opportunity/presenter";
import { PublishStatus, Role } from "@prisma/client";
import OpportunityService from "@/application/opportunity/service";
import { getCurrentUserId } from "@/utils";

export default class OpportunityUseCase {
  static async visitorBrowsePublicOpportunities(
    { filter, sort, cursor, first }: GqlQueryOpportunitiesPublicArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    await OpportunityService.validatePublishStatus([PublishStatus.PUBLIC], filter);

    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async memberBrowseCommunityInternalOpportunities(
    { filter, sort, cursor, first }: GqlQueryOpportunitiesCommunityInternalArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    const currentUserId = getCurrentUserId(ctx);

    await OpportunityService.validatePublishStatus(
      [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL],
      filter,
    );

    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      sort,
      filter: {
        and: [
          {
            or: [{ createdByUserIds: [currentUserId] }],
          },
          ...(filter ? [filter] : []),
        ],
      },
      first,
    });
  }

  static async managerBrowseAllOpportunities(
    { filter, sort, cursor, first }: GqlQueryOpportunitiesAllArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async visitorBrowseOpportunitiesByCommunity(
    { id }: GqlCommunity,
    { first, cursor, filter }: GqlCommunityOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      filter: { ...filter, communityIds: [id] },
      first,
    });
  }

  static async visitorBrowseOpportunitiesCreatedByUser(
    { id }: GqlUser,
    { first, cursor, filter }: GqlUserOpportunitiesCreatedByMeArgs,
    ctx: IContext,
  ) {
    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      filter: { ...filter, createdByUserIds: [id] },
      first,
    });
  }

  static async visitorBrowseOpportunitiesByPlace(
    { id }: GqlPlace,
    { first, cursor, filter }: GqlPlaceOpportunitiesArgs,
    ctx: IContext,
  ) {
    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      filter: { ...filter, placeIds: [id] },
      first,
    });
  }

  static async visitorViewOpportunity(
    ctx: IContext,
    { id, permissions }: GqlQueryOpportunityArgs,
  ): Promise<GqlOpportunity | null> {
    const currentUserId = ctx.currentUser?.id;
    const { isManager, isMember } = checkMembershipRole(
      ctx,
      permissions.communityId,
      currentUserId,
    );

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
