import { GraphQLError } from "graphql";

const isProductionDefault = process.env.NODE_ENV === "production";

/**
 * `@graphql-authz` plugin's `processError` hook.
 *
 * Pass `GraphQLError` 派生 (ApolloError / AuthorizationError /
 * NotFoundError / ValidationError 等) through unchanged so the
 * structured `extensions.code` (FORBIDDEN / UNAUTHENTICATED /
 * NOT_FOUND / VALIDATION_ERROR) reaches the client. Without this,
 * production formerly replaced every authz failure with
 * `Error("Internal Server Error")` and surfaced as HTTP 500 +
 * INTERNAL_SERVER_ERROR — frontends could not distinguish a
 * legitimate authz rejection from a real server fault.
 *
 * Non-production echoes the original error so developers see
 * the unmodified stack. Production wraps non-GraphQLError
 * surprises (Prisma raw errors, TypeErrors, etc.) in a generic
 * `Error("Internal Server Error")` to avoid leaking internals.
 *
 * Lives in its own module (separate from `server.ts`) so the unit
 * test can import it without dragging in the full GraphQL schema /
 * domain modules.
 */
export function processAuthzError(
  error: unknown,
  isProd: boolean = isProductionDefault,
): never {
  if (error instanceof GraphQLError) {
    throw error;
  }
  if (!isProd) {
    throw error;
  }
  throw new Error("Internal Server Error");
}
