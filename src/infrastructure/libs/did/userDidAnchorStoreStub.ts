/**
 * TODO(phase1-final): replace with Prisma-backed UserDidAnchorRepository.
 *
 * Stub implementation of `UserDidAnchorStore` used until the
 * `t_user_did_anchors` Prisma model lands (Phase 1 schema PR #1094) and
 * the proper repository/service stack is wired (Phase 1 application
 * service PR).
 *
 * Behavior: `findLatestByUserId` always resolves to `null`, so callers
 * such as `DidDocumentResolver` see "no anchor record exists for this
 * user" — the HTTP layer (`/users/:userId/did.json`) maps that to 404,
 * which is the correct interim behavior because no user has an anchor
 * yet (the batch worker that creates them lands in Phase 1 step 7).
 *
 * This file is intentionally minimal: it carries no Prisma dependency,
 * no DI of repositories, no schema knowledge. Once the schema PR
 * merges, replace this whole file with a Prisma-backed implementation
 * (and update `provider.ts` to register that class instead).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.4 (DidDocumentResolver)
 *   docs/report/did-vc-internalization.md §5.4 (public routes)
 *   docs/report/did-vc-internalization.md §4.1 (UserDidAnchor schema)
 */

import { injectable } from "tsyringe";
import type {
  UserDidAnchorRow,
  UserDidAnchorStore,
} from "@/infrastructure/libs/did/didDocumentResolver";

@injectable()
export class UserDidAnchorStoreStub implements UserDidAnchorStore {
  async findLatestByUserId(_userId: string): Promise<UserDidAnchorRow | null> {
    return null;
  }
}
