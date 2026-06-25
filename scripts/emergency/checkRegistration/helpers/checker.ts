import { auth } from "../../../../src/infrastructure/libs/firebase";
import logger from "../../../../src/infrastructure/logging";
import { CheckInputRecord, CheckResult } from "../types";

/**
 * 1件の電話番号について、Firebaseにユーザーが存在するかだけを確認する。
 * 副作用なし（ウォレット作成・DB書き込みは一切行わない）。
 */
export async function checkRecord(record: CheckInputRecord): Promise<CheckResult> {
  try {
    const userRecord = await auth.getUserByPhoneNumber(record.phoneNumber);
    return {
      kind: "registered",
      phoneNumber: record.phoneNumber,
      name: record.name,
      firebaseUid: userRecord.uid,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      kind: "notRegistered",
      phoneNumber: record.phoneNumber,
      name: record.name,
      error: errorMessage,
    };
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
