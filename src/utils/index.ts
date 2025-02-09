import { IContext } from "@/types/server";

export function calculateDifferences<T>(existingIds: Set<T>, newIds?: T[]) {
  const toAdd = newIds?.filter((id) => !existingIds.has(id)) || [];
  const toRemove = [...existingIds].filter((id) => !newIds?.includes(id));
  return { toAdd, toRemove };
}

export function getCurrentUserId(ctx: IContext): string {
  const currentUserId = ctx.currentUser?.id;
  if (!currentUserId) {
    throw new Error("Unauthorized: User must be logged in");
  }
  return currentUserId;
}
