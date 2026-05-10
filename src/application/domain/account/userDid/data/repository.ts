/**
 * Stub repository for `UserDidAnchor`.
 *
 * Strategy A note (Phase 1 step 7) ----------------------------------------
 *
 * The `t_user_did_anchors` Prisma model lands in a sibling PR
 * (`claude/phase1-schema-migration`, #1094). Until that merges, we cannot
 * issue real Prisma queries against `tx.userDidAnchor` — the type does not
 * exist yet on `Prisma.TransactionClient`.
 *
 * To keep the application layer compilable and DI-resolvable today:
 *
 *   - `findLatestByUserId` returns `null` (mirrors "no row" — appropriate
 *     for both DI smoke tests and the resolver fallback to 404).
 *   - `createCreate` / `createUpdate` / `createDeactivate` throw a
 *     `NotImplementedError` with a TODO marker. The service still calls them
 *     so that downstream test doubles can verify the call shape; production
 *     code will get a real implementation when the schema PR merges.
 *
 * After the schema PR merges, the swap is mechanical — replace the bodies
 * with the equivalents already prototyped in `DIDIssuanceRequestRepository`
 * (see `src/application/domain/account/identity/didIssuanceRequest/data/repository.ts`).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (UserDidAnchor schema)
 *   docs/report/did-vc-internalization.md §5.2.1 (Application service shape)
 *   docs/report/did-vc-internalization.md §5.1.4 (DidDocumentResolver storage interface)
 */

import { injectable } from "tsyringe";
import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import type { IUserDidAnchorRepository } from "@/application/domain/account/userDid/data/interface";
import type {
  CreateUserDidAnchorInput,
  DeactivateUserDidAnchorInput,
  UpdateUserDidAnchorInput,
  UserDidAnchorRow,
} from "@/application/domain/account/userDid/data/type";

/**
 * Marker error so tests / runtime callers can distinguish "feature not
 * wired up yet" from "feature broken". Keeping it local avoids cross-PR
 * coupling — once the real repository lands this class is deleted.
 */
export class UserDidAnchorRepositoryNotImplementedError extends Error {
  constructor(method: string) {
    super(
      `UserDidAnchorRepositoryStub.${method}: not implemented yet — depends on ` +
        "schema PR (#1094, t_user_did_anchors). Replace stub with the production " +
        "Prisma-backed repository after that PR merges (Phase 1 step 8+).",
    );
    this.name = "UserDidAnchorRepositoryNotImplementedError";
  }
}

@injectable()
export default class UserDidAnchorRepositoryStub implements IUserDidAnchorRepository {
  // findLatestByUserId is the only method that has a meaningful no-op:
  // returning `null` correctly tells the resolver "no anchor for this user".
  // The signature matches `UserDidAnchorStore` from the resolver.
  async findLatestByUserId(_userId: string): Promise<UserDidAnchorRow | null> {
    return null;
  }

  // TODO(phase1-final): swap to Prisma-backed implementation once
  // `t_user_did_anchors` is in the generated client.
  async createCreate(
    _ctx: IContext,
    _input: CreateUserDidAnchorInput,
    _tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow> {
    throw new UserDidAnchorRepositoryNotImplementedError("createCreate");
  }

  // TODO(phase1-final): swap to Prisma-backed implementation once
  // `t_user_did_anchors` is in the generated client.
  async createUpdate(
    _ctx: IContext,
    _input: UpdateUserDidAnchorInput,
    _tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow> {
    throw new UserDidAnchorRepositoryNotImplementedError("createUpdate");
  }

  // TODO(phase1-final): swap to Prisma-backed implementation once
  // `t_user_did_anchors` is in the generated client.
  async createDeactivate(
    _ctx: IContext,
    _input: DeactivateUserDidAnchorInput,
    _tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow> {
    throw new UserDidAnchorRepositoryNotImplementedError("createDeactivate");
  }
}
