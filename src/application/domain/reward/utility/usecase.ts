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
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

@injectable()
export default class UtilityUseCase {
  constructor(
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
    @inject("UtilityService") private readonly service: IUtilityService,
  ) {}

  async anyoneBrowseUtilities(
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

    await this.service.validatePublishStatus(allowedPublishStatuses, filter);

    const validatedFilter = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
      filter,
    );

    const records = await this.service.fetchUtilities(
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

  async visitorViewUtility(
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

    const record = await this.service.findUtility(ctx, id, validatedFilter);
    return record ? UtilityPresenter.get(record) : null;
  }

  async managerCreateUtility(
    ctx: IContext,
    { input }: GqlMutationUtilityCreateArgs,
  ): Promise<GqlUtilityCreatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const res = await this.service.createUtility(ctx, input, tx);
      return UtilityPresenter.create(res);
    });
  }

  async managerDeleteUtility(
    ctx: IContext,
    { id }: GqlMutationUtilityDeleteArgs,
  ): Promise<GqlUtilityDeletePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const res = await this.service.deleteUtility(ctx, id, tx);
      return UtilityPresenter.delete(res);
    });
  }

  async managerUpdateUtilityInfo(
    ctx: IContext,
    args: GqlMutationUtilityUpdateInfoArgs,
  ): Promise<GqlUtilityUpdateInfoPayload> {
    return this.issuer.public(ctx, async (tx) => {
      const res = await this.service.updateUtilityInfo(ctx, args, tx);
      return UtilityPresenter.updateInfo(res);
    });
  }
}

function validateByMembershipRoles(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
  currentUserId?: string,
  filter?: GqlUtilityFilterInput,
): GqlUtilityFilterInput {
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
