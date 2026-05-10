/**
 * Repository contract for the `userDid` application domain.
 *
 * The interface is intentionally narrow — only the four operations used by
 * `UserDidService` are declared. Heavier query patterns (e.g. paginated
 * listing for an admin UI) live behind a separate interface and will be
 * added in a later phase.
 *
 * `findLatestByUserId` matches the `UserDidAnchorStore` interface declared
 * in `src/infrastructure/libs/did/didDocumentResolver.ts` so a single
 * production repository (`UserDidAnchorRepository`) satisfies both the
 * resolver and the application service via two DI bindings.
 *
 * The `tx` argument follows the project-wide branching pattern (see
 * CLAUDE.md "Transaction Handling Pattern"): when `tx` is supplied, the
 * repository must execute against it; when omitted, it must obtain its own
 * issuer-scoped client.
 */

import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import type {
  CreateUserDidAnchorInput,
  DeactivateUserDidAnchorInput,
  UpdateUserDidAnchorInput,
  UserDidAnchorRow,
} from "@/application/domain/account/userDid/data/type";
import type { UserDidAnchorStore } from "@/infrastructure/libs/did/didDocumentResolver";

export interface IUserDidAnchorRepository extends UserDidAnchorStore {
  /**
   * Return the most recently-created anchor for `userId`, regardless of
   * status (PENDING included per §F). Returns `null` when no row exists.
   *
   * Inherited from `UserDidAnchorStore` so the production class can be
   * reused by `DidDocumentResolver` without an adapter.
   */
  findLatestByUserId(userId: string): Promise<UserDidAnchorRow | null>;

  createCreate(
    ctx: IContext,
    input: CreateUserDidAnchorInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow>;

  createUpdate(
    ctx: IContext,
    input: UpdateUserDidAnchorInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow>;

  createDeactivate(
    ctx: IContext,
    input: DeactivateUserDidAnchorInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow>;
}
