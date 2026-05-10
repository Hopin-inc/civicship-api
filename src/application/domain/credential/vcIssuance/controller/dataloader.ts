/**
 * `VcIssuance` DataLoader factory (Phase 1.5).
 *
 * Batched lookups for the relations exposed by the `VcIssuance`
 * GraphQL type:
 *
 *   - `VcIssuance.user`        — required, keyed on `parent.userId`
 *   - `VcIssuance.evaluation`  — optional, keyed on `parent.evaluationId`
 *                                 (skipped when the FK is null, e.g. VCs
 *                                 issued outside an evaluation flow)
 *
 * Per the codebase convention these are functional factories taking a
 * shared `PrismaClient` (see `src/presentation/graphql/dataloader/utils.ts`).
 * They slot into `createLoaders()` so a single per-request batch is
 * shared across all `VcIssuance` rows in the response, preventing N+1.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 *   src/presentation/graphql/dataloader/README.md
 */

import { PrismaClient } from "@prisma/client";
import UserPresenter from "@/application/domain/account/user/presenter";
import { userSelectDetail } from "@/application/domain/account/user/data/type";
import EvaluationPresenter from "@/application/domain/experience/evaluation/presenter";
import {
  evaluationSelectDetail,
  PrismaEvaluationDetail,
} from "@/application/domain/experience/evaluation/data/type";
import { GqlEvaluation } from "@/types/graphql";
import {
  createLoaderById,
  createNullableLoaderById,
} from "@/presentation/graphql/dataloader/utils";

/**
 * Loader for `VcIssuance.user`. Keys on `parent.userId` (always set on
 * the GraphQL `VcIssuance` type — `userId: ID!`).
 */
export function createUserByVcIssuanceLoader(prisma: PrismaClient) {
  return createLoaderById(
    async (ids) =>
      prisma.user.findMany({
        where: { id: { in: [...ids] } },
        select: userSelectDetail,
      }),
    UserPresenter.get,
  );
}

/**
 * Loader for `VcIssuance.evaluation`. Uses
 * `createNullableLoaderById` because `evaluationId` is optional on the
 * row (VCs not tied to an evaluation pass `null` / `undefined`); the
 * loader short-circuits null keys without hitting Prisma.
 */
export function createEvaluationByVcIssuanceLoader(prisma: PrismaClient) {
  return createNullableLoaderById<PrismaEvaluationDetail, GqlEvaluation>(
    async (ids) =>
      prisma.evaluation.findMany({
        where: { id: { in: [...ids] } },
        select: evaluationSelectDetail,
      }),
    EvaluationPresenter.get,
  );
}
