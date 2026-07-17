-- メンバー → コミュニティへのポイント送付（フリマ支払い・DAO への返還等）を
-- 表す CONTRIBUTION を TransactionReason に追加する。additive な変更。
-- PostgreSQL 12+ では、追加した enum 値を同一トランザクション内で参照しない限り
-- ADD VALUE をトランザクション内で実行できる。

-- AlterEnum
ALTER TYPE "TransactionReason" ADD VALUE 'CONTRIBUTION';
