/**
 * =============================================================================
 * GdprDeletionService — §9.7 GDPR / 個人情報削除と chain 整合性
 * =============================================================================
 *
 * 本ファイルは Phase 4+ 実装のための **scaffold** である。実 deletion ロジック
 * は本 PR には含まれない。すべての public method は
 *   `throw new Error("not implemented — §9.7 Phase 4+ task")`
 * のみを行う。実装は別 PR (Phase 4+) で行う。
 *
 * -----------------------------------------------------------------------------
 * 設計参照
 * -----------------------------------------------------------------------------
 *   docs/report/did-vc-internalization.md §9.7 (line 1788-1876)
 *     "GDPR / 個人情報削除と chain 整合性 (§N 対応)"
 *
 * -----------------------------------------------------------------------------
 * 設計要点
 * -----------------------------------------------------------------------------
 *
 *   1. **chain 上の anchor は削除不能**
 *      Cardano on-chain anchor (UserDidAnchor.chainTxHash /
 *      VcAnchor.rootHash) は不可逆性こそが anchor の価値。GDPR Art. 17
 *      「忘れられる権利」のために on-chain データを書き換えることはできない。
 *      → **そもそも chain 上には PII を直接書き込まない設計** とすることで、
 *        この問題を回避する。chain に乗るのは hash と cuid 形式の DID 文字列
 *        のみで、復元不能・PII 該当回避。
 *
 *   2. **削除は DB の personal data に対してのみ実施**
 *      DB 上の以下を削除（または匿名化）する:
 *        - User: PII カラム (email, name, phone) を匿名化、deletedAt をセット
 *        - Identity / Membership / Wallet: PII 含む列を NULL/匿名化
 *        - DidIssuanceRequest: subject DID 紐付けを削除
 *        - VcIssuanceRequest: VC JWT payload (subject claim を含む) を削除
 *        - UserDidAnchor: DB 行は物理削除（chain hash は orphan 化）
 *      ただし監査ログ保管期間 (§9.7 では 90 日例) は論理削除のみ。
 *
 *   3. **verifier 視点で実質削除と同等**
 *      DB 側の DID Document が消える → did:web:api.civicship.app:users:u_xyz
 *      の resolve が `404 Not Found` を返す → verifier は VC を検証不能
 *      → 実質、DID/VC ともに削除されたのと同じ効果。
 *      chain anchor は orphan として残るが、対応する DID Document が存在
 *      しない限り意味を持たない。
 *
 *   4. **削除フローは 2 段階 (cf. §9.7 ユーザー削除時のフロー)**
 *      a. 論理削除フェーズ: VC 一括 revoke → DID DEACTIVATE op 発行
 *         → User.deletedAt セット → PII カラム匿名化
 *      b. 物理削除フェーズ (X 日経過後): VcIssuanceRequest →
 *         UserDidAnchor → User の順に物理削除
 *      この 2 段階を本 service の `deleteUserData` で吸収するか、
 *      `deactivateUser(=論理)` と `purgeUserData(=物理)` に分けるかは
 *      Phase 4+ の実装時に決定する。
 *
 *   5. **DID DEACTIVATE と VC revocation は不可分**
 *      §4 cascade ロジックに従い、DID 失効 ＋ VC 取り消しは 1 つの
 *      transaction として扱う。実装漏れ防止のため usecase.ts に集約する
 *      (本 PR では usecase 層もまだ存在しない)。
 *
 * -----------------------------------------------------------------------------
 * 削除対象 entity リスト (Phase 4+ 実装時に確定)
 * -----------------------------------------------------------------------------
 *
 *   PII を含む / DID-VC chain と連動する主な entity:
 *     - User (匿名化)
 *     - Identity
 *     - Membership
 *     - Wallet
 *     - DidIssuanceRequest
 *     - VcIssuanceRequest
 *     - UserDidAnchor       ← DB 削除、chainTxHash は orphan 化
 *     - VcAnchor / VcIssuance ← rootHash は orphan 化
 *     - その他 PII を含む派生 entity (notification 履歴等)
 *
 *   詳細削除順序は FK 制約に従い Phase 4+ の DB migration PR で決定。
 *
 * -----------------------------------------------------------------------------
 * 検証者 (verifier) 向け補足ドキュメント
 * -----------------------------------------------------------------------------
 *
 *   Phase 4+ で `docs/handbook/VERIFIER.md` (仮) に以下を記載する:
 *     - 削除済みユーザーの DID は 404 を返す
 *     - chain 上の anchor は残存するが対応 Document 不在で resolve 不能
 *     - VC は revoke 済み (StatusList のビット立て) でも検証可能だが、
 *       subject DID resolve 不能のため実質的に検証失敗扱い
 *
 * -----------------------------------------------------------------------------
 * Open question (Q12)
 * -----------------------------------------------------------------------------
 *
 *   §9.7 末尾 / 設計レビュー Q12: "EU ユーザー対応時の GDPR 削除フロー実装"
 *   は本 scaffold の範囲外。Phase 4+ で本 service の実装と並行して
 *   admin UI / GraphQL mutation / 監査ログテーブルを追加する。
 *
 * =============================================================================
 */

import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import type { IGdprDeletionService } from "@/application/domain/gdpr/data/interface";
import type {
  GdprDeletionOptions,
  GdprDeletionResult,
} from "@/application/domain/gdpr/data/type";

@injectable()
export class GdprDeletionService implements IGdprDeletionService {
  /**
   * §9.7: ユーザー個人データ削除のエントリポイント。
   *
   * 本実装は Phase 4+ で行う。本 scaffold は interface 互換性の確保と
   * DI 配線テストのために存在する。
   */
  async deleteUserData(
    _ctx: IContext,
    _userId: string,
    _options?: GdprDeletionOptions,
  ): Promise<GdprDeletionResult> {
    // TODO(§9.7 Phase 4+):
    //   1. VC 一括 revoke (StatusList ビット立て)
    //   2. DID DEACTIVATE op 発行 (UserDidAnchor)
    //   3. User.deletedAt セット + PII カラム匿名化 (論理削除フェーズ)
    //   4. 監査ログ記録 (t_gdpr_deletion_audit)
    //   5. X 日後 (例: 90 日) のバッチで物理削除
    //      (VcIssuanceRequest → UserDidAnchor → User の順)
    //   6. orphan 化された chain anchor の集計を返す
    //
    // 実装漏れ防止のため throw する。
    throw new Error("not implemented — §9.7 Phase 4+ task");
  }
}

export default GdprDeletionService;
