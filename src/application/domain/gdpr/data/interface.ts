/**
 * GDPR (§9.7) 削除フローの service interface。
 *
 * 詳細な設計背景は `src/application/domain/gdpr/service.ts` 先頭の
 * doc コメントと `docs/report/did-vc-internalization.md` §9.7 を参照。
 *
 * 本 interface は Phase 4+ 実装のための scaffold。
 */

import { IContext } from "@/types/server";
import type {
  GdprDeletionOptions,
  GdprDeletionResult,
} from "@/application/domain/gdpr/data/type";

export interface IGdprDeletionService {
  /**
   * §9.7: 指定ユーザーの全個人データを DB から削除する。
   *
   * - chain 上の anchor (UserDidAnchor.chainTxHash / VcAnchor.rootHash)
   *   は不可逆のため削除不能。orphan 化される。
   * - DB 上の DID Document / VC payload が削除されることで、verifier
   *   からの DID resolve は 404 となり、実質削除と同等となる。
   * - 削除対象 entity 一覧と削除順序は service.ts 先頭コメント参照。
   *
   * Phase 4+ 実装。本 interface は scaffold。
   *
   * @throws Error 現状は `not implemented — §9.7 Phase 4+ task` を投げる。
   */
  deleteUserData(
    ctx: IContext,
    userId: string,
    options?: GdprDeletionOptions,
  ): Promise<GdprDeletionResult>;
}
