import { IContext } from "@/types/server";
import { PublishStatus, Role } from "@prisma/client";
import { AuthorizationError, RateLimitError } from "@/errors/graphql";

export function getCurrentUserId(ctx: IContext, inputUserId?: string): string {
  if (ctx.isAdmin && inputUserId) return inputUserId;

  const currentUserId = ctx.currentUser?.id;
  if (!currentUserId) {
    throw new AuthorizationError("User must be logged in");
  }

  return currentUserId;
}

export function clampFirst(first: number | null | undefined): number {
  const LIMIT = 500;
  if (typeof first === "number" && first > LIMIT) {
    throw new RateLimitError("Cannot request more than " + LIMIT);
  }

  return first ?? 10;
}

export function getMembershipRolesByCtx(
  ctx: IContext,
  communityIds: string[],
  currentUserId?: string,
): { isManager: Record<string, boolean>; isMember: Record<string, boolean> } {
  if (!currentUserId || communityIds.length === 0) {
    return { isManager: {}, isMember: {} };
  }

  if (ctx.isAdmin) {
    const allTrue = Object.fromEntries(communityIds.map((id) => [id, true]));
    return { isManager: { ...allTrue }, isMember: { ...allTrue } };
  }

  const userMemberships = getUserMembershipMap(ctx);

  return communityIds.reduce(
    (acc, communityId) => {
      const { isManager, isMember } = determineRoleForCommunity(userMemberships, communityId);
      acc.isManager[communityId] = isManager;
      acc.isMember[communityId] = isMember;
      return acc;
    },
    { isManager: {}, isMember: {} },
  );
}

function getUserMembershipMap(ctx: IContext): Map<string, Role> {
  return new Map(ctx.currentUser?.memberships?.map((m) => [m.communityId, m.role]) || []);
}

function determineRoleForCommunity(
  userMemberships: Map<string, Role>,
  communityId: string,
): { isManager: boolean; isMember: boolean } {
  const role = userMemberships.get(communityId);
  return {
    isManager: role === Role.OWNER || role === Role.MANAGER,
    isMember: role !== undefined, // `Map.get()` は `undefined` を返すので、そのまま `boolean` に変換
  };
}

/**
 * Check if a user can view content based on publishStatus and their role.
 * - Admin: can view all
 * - Manager/Owner: can view all in their community
 * - Member: can view PUBLIC and COMMUNITY_INTERNAL
 * - Creator: can view their own content regardless of status
 * - Visitor: can view PUBLIC only
 */
export function canViewByPublishStatus(
  ctx: IContext,
  publishStatus: PublishStatus,
  communityId: string,
  createdByUserId?: string,
): boolean {
  // Admin can view everything
  if (ctx.isAdmin) {
    return true;
  }

  const currentUserId = ctx.currentUser?.id;

  // Creator can always view their own content
  if (currentUserId && createdByUserId && currentUserId === createdByUserId) {
    return true;
  }

  // Check membership role
  const { isManager, isMember } = getMembershipRolesByCtx(
    ctx,
    [communityId],
    currentUserId,
  );

  // Manager/Owner can view all statuses in their community
  if (isManager[communityId]) {
    return true;
  }

  // Member can view PUBLIC and COMMUNITY_INTERNAL
  if (isMember[communityId]) {
    return (
      publishStatus === PublishStatus.PUBLIC ||
      publishStatus === PublishStatus.COMMUNITY_INTERNAL
    );
  }

  // Visitor can only view PUBLIC
  return publishStatus === PublishStatus.PUBLIC;
}

/**
 * Check if a user can view an article based on publishStatus and their role.
 * Similar to canViewByPublishStatus but handles articles with multiple authors/relatedUsers.
 */
export function canViewArticleByPublishStatus(
  ctx: IContext,
  publishStatus: PublishStatus,
  communityId: string,
  authorIds: string[],
  relatedUserIds: string[],
): boolean {
  // Admin can view everything
  if (ctx.isAdmin) {
    return true;
  }

  const currentUserId = ctx.currentUser?.id;

  // Author or related user can always view their own content
  if (currentUserId) {
    if (authorIds.includes(currentUserId) || relatedUserIds.includes(currentUserId)) {
      return true;
    }
  }

  // Check membership role
  const { isManager, isMember } = getMembershipRolesByCtx(
    ctx,
    [communityId],
    currentUserId,
  );

  // Manager/Owner can view all statuses in their community
  if (isManager[communityId]) {
    return true;
  }

  // Member can view PUBLIC and COMMUNITY_INTERNAL
  if (isMember[communityId]) {
    return (
      publishStatus === PublishStatus.PUBLIC ||
      publishStatus === PublishStatus.COMMUNITY_INTERNAL
    );
  }

  // Visitor can only view PUBLIC
  return publishStatus === PublishStatus.PUBLIC;
}
