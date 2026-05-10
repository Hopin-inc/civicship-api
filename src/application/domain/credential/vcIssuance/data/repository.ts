/**
 * Stub repository for `VcIssuanceRequest` (post-schema-PR shape).
 *
 * Strategy A note (Phase 1 step 7) ----------------------------------------
 *
 * The Phase-1 redesign of `t_vc_issuance_requests` lands in schema PR
 * #1094. The legacy IDENTUS-era model still exists in the current
 * generated client, but its column set is incompatible (no `vcJwt`,
 * `vcAnchorId`, etc.), so we cannot back this domain with the old
 * model.
 *
 * Until #1094 merges:
 *   - `findById` returns `null` (mirrors "no row" — keeps the DI smoke
 *     path green).
 *   - `create` throws `NotImplementedError` with a TODO marker. The
 *     service's behaviour is verified via a `useValue` mock in tests; the
 *     real implementation is a 5-line Prisma call that will land alongside
 *     the schema PR.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (VcIssuanceRequest schema)
 *   docs/report/did-vc-internalization.md §5.2.2 (Application service shape)
 */

import { injectable } from "tsyringe";
import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import type { IVcIssuanceRepository } from "@/application/domain/credential/vcIssuance/data/interface";
import type {
  CreateVcIssuanceInput,
  VcIssuanceRow,
} from "@/application/domain/credential/vcIssuance/data/type";

export class VcIssuanceRepositoryNotImplementedError extends Error {
  constructor(method: string) {
    super(
      `VcIssuanceRepositoryStub.${method}: not implemented yet — depends on ` +
        "schema PR (#1094, t_vc_issuance_requests JWT-shaped redesign). Replace " +
        "stub with the production Prisma-backed repository after that PR merges " +
        "(Phase 1 step 8+).",
    );
    this.name = "VcIssuanceRepositoryNotImplementedError";
  }
}

@injectable()
export default class VcIssuanceRepositoryStub implements IVcIssuanceRepository {
  async findById(_ctx: IContext, _id: string): Promise<VcIssuanceRow | null> {
    return null;
  }

  // Returning an empty array is the safe no-op for "no rows yet" — the
  // resolver maps it directly to an empty GraphQL list. The Prisma-backed
  // implementation will issue a `findMany` ordered by `createdAt desc`.
  async findByUserId(_ctx: IContext, _userId: string): Promise<VcIssuanceRow[]> {
    return [];
  }

  // TODO(phase1-final): swap to Prisma-backed implementation once
  // `t_vc_issuance_requests` (Phase-1 redesign) is in the generated client.
  async create(
    _ctx: IContext,
    _input: CreateVcIssuanceInput,
    _tx?: Prisma.TransactionClient,
  ): Promise<VcIssuanceRow> {
    throw new VcIssuanceRepositoryNotImplementedError("create");
  }
}
