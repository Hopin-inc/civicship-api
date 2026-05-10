/**
 * Credential-domain DataLoader composition (Phase 1.5).
 *
 * Bundles per-request loaders for the GraphQL types under
 * `application/domain/credential/`. Today only `VcIssuance` exposes
 * relations through field resolvers, so this file is small — it lives
 * separately from `account.ts` / `experience.ts` so the credential
 * domain has the same "one composition file per top-level domain"
 * shape as the rest of `dataloader/domain/`.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 *   src/presentation/graphql/dataloader/README.md
 */

import { PrismaClient } from "@prisma/client";
import {
  createUserByVcIssuanceLoader,
  createEvaluationByVcIssuanceLoader,
} from "@/application/domain/credential/vcIssuance/controller/dataloader";

export function createCredentialLoaders(prisma: PrismaClient) {
  return {
    userByVcIssuance: createUserByVcIssuanceLoader(prisma),
    evaluationByVcIssuance: createEvaluationByVcIssuanceLoader(prisma),
  };
}
