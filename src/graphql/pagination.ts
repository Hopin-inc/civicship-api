import { GraphQLError } from "graphql/error";

export function clampFirst(first: number | null | undefined): number {
  if (typeof first === "number" && first > 100) {
    throw new GraphQLError(`Cannot request more than ${first} objects`, {
      extensions: {
        code: "LIMIT_EXCEEDED",
        first,
      },
    });
  }

  return first ?? 10;
}
