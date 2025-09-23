import { IContext } from "@/types/server";
import { Role } from "@prisma/client";
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
  return new Map(ctx.hasPermissions?.memberships?.map((m) => [m.communityId, m.role]) || []);
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

export interface CustomPropsV1 {
  propsVersion: 1;
  nftMintId?: string;
  nftWalletId?: string;
  userRef?: string;
  orderId?: string;
  orderItemId?: string;
  nftInstanceId?: string;
  receiverAddress?: string;
}

function isValidCustomPropsV1(obj: any): obj is CustomPropsV1 {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    obj.propsVersion === 1 &&
    (obj.nftMintId === undefined || typeof obj.nftMintId === 'string') &&
    (obj.nftWalletId === undefined || typeof obj.nftWalletId === 'string') &&
    (obj.userRef === undefined || typeof obj.userRef === 'string') &&
    (obj.orderId === undefined || typeof obj.orderId === 'string') &&
    (obj.orderItemId === undefined || typeof obj.orderItemId === 'string') &&
    (obj.nftInstanceId === undefined || typeof obj.nftInstanceId === 'string') &&
    (obj.receiverAddress === undefined || typeof obj.receiverAddress === 'string')
  );
}

export function buildCustomProps(input: Partial<CustomPropsV1>): string {
  const props: CustomPropsV1 = {
    propsVersion: 1,
    ...input,
  };
  return JSON.stringify(props);
}

export function parseCustomProps(raw: string): { success: true; data: CustomPropsV1 } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(raw);
    if (isValidCustomPropsV1(parsed)) {
      return { success: true, data: parsed };
    }
    return { success: false, error: 'Invalid CustomPropsV1 structure' };
  } catch (error) {
    return { success: false, error: 'Invalid JSON' };
  }
}
