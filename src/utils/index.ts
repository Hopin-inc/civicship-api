import { IContext } from "@/types/server";
import { GraphQLError } from "graphql/error";

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

export function clampFirst(first: number | null | undefined): number {
  if (typeof first === "number" && first > 500) {
    throw new GraphQLError(`Cannot request more than ${first} objects`, {
      extensions: {
        code: "LIMIT_EXCEEDED",
        first,
      },
    });
  }

  return first ?? 10;
}
