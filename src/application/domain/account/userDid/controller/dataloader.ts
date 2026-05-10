/**
 * `UserDidAnchor` DataLoader factory (Phase 1.5).
 *
 * Provides batched lookups for the relations exposed by the
 * `UserDidAnchor` GraphQL type. Today that means a single edge —
 * `UserDidAnchor.user` — so the loader is a per-request batched
 * `userId → GqlUser` resolver. Co-locating it under this domain keeps
 * the `controller/dataloader.ts` convention used elsewhere (CLAUDE.md
 * "Standard Domain Pattern") and gives us a stable surface to extend
 * if the type later grows (e.g. `confirmedBy` as a separate principal).
 *
 * The codebase-wide convention is functional factories that take the
 * shared `PrismaClient` rather than DI'd class loaders, see
 * `src/presentation/graphql/dataloader/utils.ts` and the existing
 * factories under `account/user/controller/dataloader.ts`. We follow
 * the same shape so this slots into `createLoaders()` without bespoke
 * wiring.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.1
 *   src/presentation/graphql/dataloader/README.md
 */

import { PrismaClient } from "@prisma/client";
import UserPresenter from "@/application/domain/account/user/presenter";
import { userSelectDetail } from "@/application/domain/account/user/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

/**
 * Loader for `UserDidAnchor.user`. Keys on `parent.userId` (carried on
 * the resolver result by `UserDidPresenter.view`) and resolves to the
 * fully-projected `GqlUser`. Returns `null` when the referenced user
 * has been deleted so the field resolver stays total over historical
 * anchors.
 */
export function createUserByUserDidAnchorLoader(prisma: PrismaClient) {
  return createLoaderById(
    async (ids) =>
      prisma.user.findMany({
        where: { id: { in: [...ids] } },
        select: userSelectDetail,
      }),
    UserPresenter.get,
  );
}
