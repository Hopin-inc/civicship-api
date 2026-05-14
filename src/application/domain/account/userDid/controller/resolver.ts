/**
 * `UserDidResolver` — GraphQL Query / Mutation entry points for the
 * `UserDidAnchor` type (§5.2.1 / Phase 1 step 8).
 *
 * Per CLAUDE.md "Layer Responsibilities", the resolver delegates to the
 * usecase layer immediately and contains no business logic. Authorization
 * is enforced by `@authz` directives in the schema files (`IsUser` for
 * the read, `IsSelf` for the writes).
 *
 * Phase 1.5 addition: `UserDidAnchor.user` field resolver — resolves the
 * anchor's owning user via the **shared** per-request DataLoader
 * `ctx.loaders.user` (registered in
 * `src/presentation/graphql/dataloader/domain/account.ts`).
 *
 * 共通 loader を使う設計上の理由:
 *  - `userId → GqlUser` の取得は他ドメインの field resolver と完全に
 *    同形なので、独立した loader を作ると 1 リクエスト内で同じ user に
 *    対するバッチが分散してしまう (e.g. `Article.author` と
 *    `UserDidAnchor.user` で 2 回叩く)。
 *  - `ctx.loaders.user` は per-request scope かつ同じ key にキャッシュが
 *    効くため、これに集約することで真の N+1 防止になる。
 *  - SonarCloud の duplicate-block 検出 (PR #1113) を構造的に解消する。
 *
 * `userId` 外部キーは `UserDidPresenter.view` が resolver 結果に乗せて
 * くれるので、field resolver は `parent.userId` だけ読めばよい。
 * `ctx.loaders.user` は `createLoaderById` ベースで `null` を許容する
 * 戻り値型なので、user が削除済みのケースでも例外を投げず `null` が
 * 流れる (schema 側 `User` を nullable に揃えてある)。
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import UserDidUseCase from "@/application/domain/account/userDid/usecase";
import type {
  GqlMutationCreateUserDidArgs,
  GqlMutationDeactivateUserDidArgs,
  GqlQueryUserDidArgs,
  GqlUserDidAnchor,
} from "@/types/graphql";

/**
 * Resolver-result shape: GraphQL `UserDidAnchor` plus the `userId`
 * foreign key carried by `UserDidPresenter.view`. Declared locally so
 * the field resolver can read `parent.userId` without casting.
 */
type UserDidAnchorParent = GqlUserDidAnchor & { userId: string };

@injectable()
export default class UserDidResolver {
  constructor(@inject("UserDidUseCase") private readonly userDidUseCase: UserDidUseCase) {}

  Query = {
    userDid: (_: unknown, args: GqlQueryUserDidArgs, ctx: IContext) => {
      return this.userDidUseCase.viewUserDid(ctx, args.userId);
    },
  };

  Mutation = {
    createUserDid: (_: unknown, args: GqlMutationCreateUserDidArgs, ctx: IContext) => {
      return this.userDidUseCase.createUserDidForUser(
        ctx,
        args.input.userId,
        args.input.network ?? undefined,
      );
    },
    deactivateUserDid: (_: unknown, args: GqlMutationDeactivateUserDidArgs, ctx: IContext) => {
      return this.userDidUseCase.deactivateUserDidForUser(ctx, args.userId);
    },
  };

  UserDidAnchor = {
    user: (parent: UserDidAnchorParent, _: unknown, ctx: IContext) => {
      return ctx.loaders.user.load(parent.userId);
    },
  };
}
