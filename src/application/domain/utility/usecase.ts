import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlUtility,
  GqlUtilitiesConnection,
  GqlMutationUtilityCreateArgs,
  GqlUtilityCreatePayload,
  GqlMutationUtilityDeleteArgs,
  GqlUtilityDeletePayload,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityUpdateInfoPayload,
  GqlUtilityFilterInput,
} from "@/types/graphql";
import UtilityService from "@/application/domain/utility/service";
import UtilityPresenter from "@/application/domain/utility/presenter";
import { IContext } from "@/types/server";
import { PublishStatus } from "@prisma/client";
import { clampFirst, getMembershipRolesByCtx } from "@/application/domain/utils";

export default class UtilityUseCase {
  static async anyoneBrowseUtilities(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUtilitiesArgs,
  ): Promise<GqlUtilitiesConnection> {
    const take = clampFirst(first);

    const currentUserId = ctx.currentUser?.id;
    const communityIds = ctx.hasPermissions?.memberships?.map((m) => m.communityId) || [];

    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);
    const allowedPublishStatuses = isManager
      ? Object.values(PublishStatus)
      : isMember
        ? [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL]
        : [PublishStatus.PUBLIC];

    await UtilityService.validatePublishStatus(allowedPublishStatuses, filter);

    const validatedFilter = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
      filter,
    );

    const records = await UtilityService.fetchUtilities(
      ctx,
      {
        cursor,
        filter: validatedFilter,
        sort,
      },
      take,
    );

    const hasNextPage = records.length > take;

    const data = records.slice(0, take).map((record) => UtilityPresenter.get(record));
    return UtilityPresenter.query(data, hasNextPage);
  }

  static async visitorViewUtility(
    ctx: IContext,
    { id, permission }: GqlQueryUtilityArgs,
  ): Promise<GqlUtility | null> {
    const currentUserId = ctx.currentUser?.id;
    const communityIds = [permission.communityId];
    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);

    const validatedFilter = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
    );

    const record = await UtilityService.findUtility(ctx, id, validatedFilter);
    return record ? UtilityPresenter.get(record) : null;
  }

  static async managerCreateUtility(
    ctx: IContext,
    { input }: GqlMutationUtilityCreateArgs,
  ): Promise<GqlUtilityCreatePayload> {
    const res = await UtilityService.createUtility(ctx, input);
    return UtilityPresenter.create(res);
  }

  static async managerDeleteUtility(
    ctx: IContext,
    { id }: GqlMutationUtilityDeleteArgs,
  ): Promise<GqlUtilityDeletePayload> {
    const res = await UtilityService.deleteUtility(ctx, id);
    return UtilityPresenter.delete(res);
  }

  static async managerUpdateUtilityInfo(
    ctx: IContext,
    args: GqlMutationUtilityUpdateInfoArgs,
  ): Promise<GqlUtilityUpdateInfoPayload> {
    const res = await UtilityService.updateUtilityInfo(ctx, args);
    return UtilityPresenter.updateInfo(res);
  }
}

function validateByMembershipRoles(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
  currentUserId?: string,
  filter?: GqlUtilityFilterInput,
): GqlUtilityFilterInput {
  if (communityIds.length === 0) {
    return {
      and: [{ publishStatus: [PublishStatus.PUBLIC] }, ...(filter ? [filter] : [])],
    };
  }

  const orConditions = communityIds.map((communityId) => {
    if (isManager[communityId]) {
      return {
        and: [{ communityId }, ...(filter ? [filter] : [])],
      };
    }
    return {
      and: [
        { communityId },
        {
          or: [
            { publishStatus: [PublishStatus.PUBLIC] },
            ...(isMember[communityId]
              ? [{ publishStatus: [PublishStatus.COMMUNITY_INTERNAL] }]
              : []),
          ],
        },
        ...(filter ? [filter] : []),
      ],
    };
  });

  return orConditions.length > 0 ? { or: orConditions } : {};
}
