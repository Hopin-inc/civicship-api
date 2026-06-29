import { auth } from "@/infrastructure/libs/firebase";
import logger from "@/infrastructure/logging";
import { CheckInputRecord, CheckResult } from "../types";

/**
 * 1件の電話番号について、Firebaseにユーザーが存在するかだけを確認する。
 * 副作用なし（ウォレット作成・DB書き込みは一切行わない）。
 *
 * エラーは種類で分類する:
 *   - auth/user-not-found      → notRegistered（まだ未登録）
 *   - auth/invalid-phone-number → invalidPhone（電話番号が不正で確認不可）
 *   - それ以外（ネットワーク/レート制限/認証不備など）→ 再スローして中断
 * すべてを未登録扱いにすると、一時的な障害を「未登録」と誤判定してしまうため。
 */
export async function checkRecord(record: CheckInputRecord): Promise<CheckResult> {
  // CSVパース時点で正規化できなかった番号は Firebase に問い合わせない
  if (record.invalidReason) {
    return {
      kind: "invalidPhone",
      phoneNumber: record.phoneNumber,
      name: record.name,
      error: record.invalidReason,
    };
  }

  try {
    const userRecord = await auth.getUserByPhoneNumber(record.phoneNumber);
    return {
      kind: "registered",
      phoneNumber: record.phoneNumber,
      name: record.name,
      firebaseUid: userRecord.uid,
    };
  } catch (err) {
    const error = err as { code?: string; message?: string };
    const errorMessage = error?.message ?? String(err);

    if (error?.code === "auth/user-not-found") {
      return {
        kind: "notRegistered",
        phoneNumber: record.phoneNumber,
        name: record.name,
        error: errorMessage,
      };
    }

    if (error?.code === "auth/invalid-phone-number") {
      return {
        kind: "invalidPhone",
        phoneNumber: record.phoneNumber,
        name: record.name,
        error: errorMessage,
      };
    }

    // 予期せぬエラーは「未登録」と誤判定せず、ログを残して処理を中断する
    // 電話番号 (PII) は意図せず流出しないようコードとメッセージのみ残す
    logger.error(`予期せぬエラーのため中断します`, {
      code: error?.code,
      error: errorMessage,
    });
    throw err;
  }
}

/**
 * 全件を順次チェックする。Firebase Admin のレート制限に配慮して直列実行。
 */
export async function checkAll(records: CheckInputRecord[]): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const total = records.length;

  for (let i = 0; i < total; i++) {
    const result = await checkRecord(records[i]);
    results.push(result);

    if ((i + 1) % 50 === 0 || i + 1 === total) {
      logger.info(`進捗: ${i + 1}/${total} 件チェック完了`);
    }
  }

  return results;
}
