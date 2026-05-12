/**
 * GDPR (§9.7) 削除フロー関連の型定義。
 *
 * Phase 4+ 実装のための scaffold。詳細は
 * `src/application/domain/gdpr/service.ts` 先頭コメント、および
 * `docs/report/did-vc-internalization.md` §9.7 を参照。
 */

/**
 * §9.7: ユーザー個人データ削除のリクエストオプション。
 */
export type GdprDeletionOptions = {
  /**
   * 削除理由（監査ログ用）。例: "user_request", "gdpr_art17",
   * "admin_initiated"。
   *
   * Phase 4+ で監査ログテーブル (t_gdpr_deletion_audit) に記録する。
   */
  reason?: string;
};

/**
 * §9.7: 削除実行結果。
 *
 * 「DB 上で削除した行数」と「chain 上に orphan として残る anchor 数」を
 * 分けて返すことで、verifier 側ドキュメント / 監査担当に
 * 「DB 削除は完了したが chain anchor は残存している（hash のみ）」
 * という事実を明示する。
 */
export type GdprDeletionResult = {
  /** 削除対象となった userId。 */
  userId: string;
  /**
   * DB 上で削除（または匿名化）された entity 数。
   *
   * Phase 4+ の実装対象テーブル（暫定リスト）:
   *   - User (PII カラムを匿名化、行自体は保持 → deletedAt セット)
   *   - Identity / Membership / Wallet (PII 関連)
   *   - DidIssuanceRequest (subjectDid を含む)
   *   - VcIssuanceRequest (subject DID / payload)
   *   - UserDidAnchor (DB 行を物理削除、chain hash は orphan 化)
   *   - その他 PII を含む派生 entity
   *
   * 詳細は §9.7 の「削除対象 entity リスト」を参照。
   */
  deletedEntityCount: number;
  /**
   * chain 上に orphan として残存する anchor 数。
   *
   * Cardano on-chain anchor は不可逆のため削除不能。
   * 該当する DB 側の DID Document / VC payload が削除されることで、
   * verifier 視点では DID resolve が `404 Not Found` となり、
   * 実質削除と同等の効果を得る。
   *
   * 内訳:
   *   - UserDidAnchor.chainTxHash
   *   - VcAnchor.rootHash
   */
  orphanedChainAnchorCount: number;
  /** 削除実行時刻 (ISO8601)。 */
  executedAt: Date;
  /**
   * リクエストに付与された削除理由（監査用）。
   */
  reason?: string;
};
