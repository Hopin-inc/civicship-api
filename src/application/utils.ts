import { IContext } from "@/types/server";
import { Prisma, Role, Todo, TransactionReason } from "@prisma/client";
import { AuthorizationError, RateLimitError } from "@/errors/graphql";
import OnboardingService from "@/application/onboarding/service";
import { initialCommunityId } from "@/consts/utils";
import TransactionService from "@/application/transaction/service";
import WalletValidator from "@/application/membership/wallet/validator";

export function getCurrentUserId(ctx: IContext): string {
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

export async function runOnboardingReward(
  ctx: IContext,
  userId: string,
  todo: Todo,
  rewardPoint: number,
  tx: Prisma.TransactionClient,
  shouldSetDone: boolean = true,
): Promise<void> {
  const onboarding = await OnboardingService.findOnboardingTodoOrThrow(ctx, userId, todo, tx);

  const { fromWalletId, toWalletId } = await WalletValidator.validateCommunityMemberTransfer(
    ctx,
    tx,
    initialCommunityId,
    userId,
    rewardPoint,
    TransactionReason.ONBOARDING,
  );

  await TransactionService.giveOnboardingPoint(
    ctx,
    {
      fromWalletId,
      fromPointChange: -rewardPoint,
      toWalletId,
      toPointChange: rewardPoint,
    },
    tx,
  );

  if (shouldSetDone) {
    await OnboardingService.setDone(ctx, onboarding.id, tx);
  }
}

export function getMembershipRolesByCtx(
  ctx: IContext,
  communityIds: string[],
  currentUserId?: string,
): { isManager: Record<string, boolean>; isMember: Record<string, boolean> } {
  if (!currentUserId || communityIds.length === 0) {
    return { isManager: {}, isMember: {} };
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
