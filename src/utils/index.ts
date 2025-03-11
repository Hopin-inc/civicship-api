import { IContext } from "@/types/server";
import { AuthorizationError, RateLimitError } from "@/errors/graphql";

export function calculateDifferences<T>(existingIds: Set<T>, newIds?: T[]) {
  const toAdd = newIds?.filter((id) => !existingIds.has(id)) || [];
  const toRemove = [...existingIds].filter((id) => !newIds?.includes(id));
  return { toAdd, toRemove };
}

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
