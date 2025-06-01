import { injectable, inject } from "tsyringe";
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
import { IContext } from "@/types/server";
import { PublishStatus } from "@prisma/client";
import { clampFirst, getMembershipRolesByCtx } from "@/application/domain/utils";
import { IUtilityService } from "./data/interface";
import UtilityPresenter from "./presenter";

@injectable()
export default class UtilityUseCase {
  constructor(@inject("UtilityService") private readonly service: IUtilityService) {}

  async anyoneBrowseUtilities(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUtilitiesArgs,
  ): Promise<GqlUtilitiesConnection> {
    const take = clampFirst(first);

    const currentUserId = ctx.currentUser?.id;
    const communityIds = ctx.hasPermissions?.memberships?.map((m) => m.communityId) || [];

    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);
    const allowedStatuses = getAllowedPublishStatuses(communityIds, isManager, isMember);

    this.service.validatePublishStatus(allowedStatuses, filter);

    const accessFilter = enforceAccessFilter(currentUserId, communityIds);
    const finalFilter = accessFilter ? { and: [accessFilter, filter ?? {}] } : (filter ?? {});

    console.dir(finalFilter, { depth: null });

    const records = await this.service.fetchUtilities(
      ctx,
      {
        cursor,
        filter: finalFilter,
        sort,
      },
      take,
    );

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => UtilityPresenter.get(record));
    return UtilityPresenter.query(data, hasNextPage);
  }

  async visitorViewUtility(
    ctx: IContext,
    { id, permission }: GqlQueryUtilityArgs,
  ): Promise<GqlUtility | null> {
    const currentUserId = ctx.currentUser?.id;
    const communityIds = [permission.communityId];

    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);

    const allowedStatuses = getAllowedPublishStatuses(communityIds, isManager, isMember);

    const accessFilter: GqlUtilityFilterInput = {
      communityIds,
      publishStatus: allowedStatuses,
    };

    const record = await this.service.findUtility(ctx, id, accessFilter);
    return record ? UtilityPresenter.get(record) : null;
  }

  async managerCreateUtility(
    ctx: IContext,
    { input, permission }: GqlMutationUtilityCreateArgs,
  ): Promise<GqlUtilityCreatePayload> {
    return ctx.issuer.public(ctx, async (tx) => {
      const res = await this.service.createUtility(ctx, input, permission.communityId, tx);
      return UtilityPresenter.create(res);
    });
  }

  async managerDeleteUtility(
    ctx: IContext,
    { id }: GqlMutationUtilityDeleteArgs,
  ): Promise<GqlUtilityDeletePayload> {
    return ctx.issuer.public(ctx, async (tx) => {
      const res = await this.service.deleteUtility(ctx, id, tx);
      return UtilityPresenter.delete(res);
    });
  }

  async managerUpdateUtilityInfo(
    ctx: IContext,
    args: GqlMutationUtilityUpdateInfoArgs,
  ): Promise<GqlUtilityUpdateInfoPayload> {
    return ctx.issuer.public(ctx, async (tx) => {
      const res = await this.service.updateUtilityInfo(ctx, args, tx);
      return UtilityPresenter.updateInfo(res);
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
): GqlUtilityFilterInput | undefined {
  if (communityIds.length === 0) return undefined;

  return {
    or: communityIds.map((communityId) => ({
      communityIds: [communityId],
    })),
  };
}
