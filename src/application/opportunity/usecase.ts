import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetHostingStatusArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreatePayload,
  GqlOpportunityDeletePayload,
  GqlOpportunityFilterInput,
  GqlOpportunitySetHostingStatusPayload,
  GqlOpportunitySetPublishStatusPayload,
  GqlOpportunityUpdateContentPayload,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityPresenter from "@/application/opportunity/presenter";
import { OpportunityHostingStatus, PublishStatus } from "@prisma/client";
import OpportunityService from "@/application/opportunity/service";
import { clampFirst, getMembershipRolesByCtx } from "@/application/utils";
import ParticipationService from "@/application/participation/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationStatusHistoryService from "@/application/participation/statusHistory/service";

export default class OpportunityUseCase {
  private static issuer = new PrismaClientIssuer();

  static async anyoneBrowseOpportunities(
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

    await OpportunityService.validatePublishStatus(allowedPublishStatuses, filter);

    const validatedFilter: GqlOpportunityFilterInput = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
      filter,
    );

    const records = await OpportunityService.fetchOpportunities(
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

  static async visitorViewOpportunity(
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
    const res = await OpportunityService.setOpportunityPublishStatus(ctx, id, input.publishStatus);
    return OpportunityPresenter.setPublishStatus(res);
  }

  static async managerSetOpportunityHostingStatus(
    { id, input }: GqlMutationOpportunitySetHostingStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySetHostingStatusPayload> {
    return await this.issuer.public(ctx, async (tx) => {
      const res = await OpportunityService.setOpportunityHostingStatus(
        ctx,
        id,
        input.hostingStatus,
      );

      if (input.hostingStatus === OpportunityHostingStatus.CANCELLED) {
        const participationIds = res.slots
          .flatMap((slot) => slot.participations ?? [])
          .map((participation) => participation.id);
        await Promise.all([
          ParticipationService.bulkCancelParticipationsByOpportunity(ctx, participationIds, tx),
          ParticipationStatusHistoryService.bulkCreateStatusHistoriesForCancelledOpportunity(
            ctx,
            participationIds,
            tx,
          ),
        ]);
      }
      return OpportunityPresenter.setHostingStatus(res);
    });
  }
}

function validateByMembershipRoles(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
  currentUserId?: string,
  filter?: GqlOpportunityFilterInput,
): GqlOpportunityFilterInput {
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
