/**
 * `VcIssuanceResolver` — GraphQL Query / Mutation entry points for the
 * `VcIssuance` type (§5.2.2 / Phase 1 step 8).
 *
 * Per CLAUDE.md "Layer Responsibilities", the resolver delegates to the
 * usecase layer immediately and contains no business logic. Authorization
 * is enforced by `@authz` directives in the schema files (`IsUser` for
 * the reads, `IsAdmin` for the issue mutation).
 *
 * Phase 1.5 addition: field resolvers for `VcIssuance.user` and
 * `VcIssuance.evaluation` — both resolve via the **shared** per-request
 * DataLoaders registered in `dataloader/domain/account.ts` /
 * `dataloader/domain/experience.ts`:
 *
 *   - `VcIssuance.user`        → `ctx.loaders.user`
 *   - `VcIssuance.evaluation`  → `ctx.loaders.evaluation`
 *
 * 共通 loader を使う設計上の理由は `UserDidResolver` と同じで、
 * `userId → GqlUser` / `evaluationId → GqlEvaluation` はリクエスト内で
 * 他ドメインの field resolver と相乗りするのが N+1 防止上正しいため。
 * 専用 loader を 3 本切ると同一 key への重複バッチが発生し、
 * SonarCloud duplicate-block の温床になる。
 *
 * `userId` は `VcIssuance` 型上で `ID!` だが、user 行が削除されている
 * 履歴行はあり得るので schema 側を `User` (nullable) に揃え、
 * `ctx.loaders.user` の `null` 戻りをそのまま流す。
 * `evaluationId` は optional FK なので、`null` のときは loader を呼ばず
 * 即 `null` を返す (DataLoader に undefined / null を渡さない契約)。
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import VcIssuanceUseCase from "@/application/domain/credential/vcIssuance/usecase";
import type {
  GqlMutationIssueVcArgs,
  GqlQueryVcIssuanceArgs,
  GqlQueryVcIssuancesByUserArgs,
  GqlVcIssuance,
} from "@/types/graphql";

@injectable()
export default class VcIssuanceResolver {
  constructor(@inject("VcIssuanceUseCase") private readonly vcIssuanceUseCase: VcIssuanceUseCase) {}

  Query = {
    vcIssuance: (_: unknown, args: GqlQueryVcIssuanceArgs, ctx: IContext) => {
      return this.vcIssuanceUseCase.viewVcIssuance(ctx, args.id);
    },
    vcIssuancesByUser: (_: unknown, args: GqlQueryVcIssuancesByUserArgs, ctx: IContext) => {
      return this.vcIssuanceUseCase.viewVcIssuancesByUser(ctx, args.userId);
    },
  };

  Mutation = {
    issueVc: (_: unknown, args: GqlMutationIssueVcArgs, ctx: IContext) => {
      return this.vcIssuanceUseCase.issueVc(ctx, args.input);
    },
  };

  VcIssuance = {
    user: (parent: GqlVcIssuance, _: unknown, ctx: IContext) => {
      return ctx.loaders.user.load(parent.userId);
    },
    evaluation: (parent: GqlVcIssuance, _: unknown, ctx: IContext) => {
      return parent.evaluationId ? ctx.loaders.evaluation.load(parent.evaluationId) : null;
    },
  };
}
