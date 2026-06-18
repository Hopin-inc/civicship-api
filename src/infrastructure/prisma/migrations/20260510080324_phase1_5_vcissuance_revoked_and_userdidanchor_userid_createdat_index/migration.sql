-- ============================================================================
-- Phase 1.5: VC revoke 表現と UserDidAnchor 取得経路の index 整備
--
--   1. VCIssuanceStatus に REVOKED 値を追加 (#1102)。
--      自前 DID/VC を internal 化した後、StatusList 2021 / Bitstring Status
--      List で revoke を表現するときに「issuance request が revoke 状態に
--      入った」ことを終端 status として記録できるようにする。実際の書込み
--      は後続の `feat/did-revoke-mutation` PR でアプリ層から行うため、本
--      migration では enum 値の宣言のみ。PostgreSQL 12+ は ALTER TYPE
--      ADD VALUE をトランザクション内で許容するが、新値を同一トランザク
--      ション内のデータが参照することは禁止される。ここでは値を追加する
--      だけなので問題ない。
--
--   2. t_user_did_anchors に (user_id, created_at DESC) 複合 index を追加
--      (#1104)。`WHERE user_id = ? ORDER BY created_at DESC LIMIT 1` で
--      ユーザー単位の最新 anchor を取得する経路 (DID resolver / VC issue
--      pipeline / revoke pipeline) が頻出するため、単独 user_id index +
--      sort では index-only scan が選ばれず、規模が育ったときに linear
--      cost が表面化する。Phase 1.5 perf TODO として保留されていたもの。
-- ============================================================================

-- AlterEnum
ALTER TYPE "VCIssuanceStatus" ADD VALUE 'REVOKED';

-- CreateIndex
CREATE INDEX "t_user_did_anchors_user_id_created_at_idx" ON "t_user_did_anchors"("user_id", "created_at" DESC);
