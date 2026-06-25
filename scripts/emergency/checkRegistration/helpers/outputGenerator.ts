import * as fs from "fs";
import * as path from "path";
import logger from "@/infrastructure/logging";
import { CheckResult, CheckSummary } from "../types";

/**
 * チェック結果の配列を種別（登録済み / 未登録 / 確認不可）ごとに振り分けて集計する。
 */
export function aggregate(results: CheckResult[]): CheckSummary {
  const summary: CheckSummary = {
    registered: [],
    notRegistered: [],
    invalidPhone: [],
  };

  for (const result of results) {
    switch (result.kind) {
      case "registered":
        summary.registered.push(result);
        break;
      case "notRegistered":
        summary.notRegistered.push(result);
        break;
      case "invalidPhone":
        summary.invalidPhone.push(result);
        break;
    }
  }

  return summary;
}

/** CSVの1フィールドをダブルクオートで囲みエスケープする（カンマ・引用符対策）。 */
function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * 集計結果を2つのCSVに書き出す:
 *   - registered.csv          … 登録済みになった人（＝前回からの変化分）
 *   - still-not-registered.csv … まだ未登録の人
 * いずれも電話番号(PII)を含むため、出力先はgit管理外ディレクトリ。
 */
export function writeOutputFiles(summary: CheckSummary, outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  // 登録済みになった人（＝前回からの変化分）
  const registeredCsv = [
    "phoneNumber,name,firebaseUid",
    ...summary.registered.map((r) => `${r.phoneNumber},${csvField(r.name)},${r.firebaseUid}`),
  ].join("\n");
  const registeredPath = path.join(outputDir, "registered.csv");
  fs.writeFileSync(registeredPath, registeredCsv, "utf-8");
  logger.info(`登録済みリストを出力しました: ${registeredPath}`, {
    count: summary.registered.length,
  });

  // まだ未登録の人
  const notRegisteredCsv = [
    "phoneNumber,name,error",
    ...summary.notRegistered.map(
      (r) => `${r.phoneNumber},${csvField(r.name)},${csvField(r.error)}`,
    ),
  ].join("\n");
  const notRegisteredPath = path.join(outputDir, "still-not-registered.csv");
  fs.writeFileSync(notRegisteredPath, notRegisteredCsv, "utf-8");
  logger.info(`未登録リストを出力しました: ${notRegisteredPath}`, {
    count: summary.notRegistered.length,
  });
}

/**
 * 集計結果のサマリ（チェック対象数・登録済み人数と登録率・未登録人数）をログ出力する。
 */
export function printSummary(summary: CheckSummary, totalChecked: number): void {
  const registered = summary.registered.length;
  const notRegistered = summary.notRegistered.length;
  const rate = totalChecked > 0 ? ((registered / totalChecked) * 100).toFixed(1) : "0.0";

  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logger.info("登録状況チェック結果（人数 = ユニーク電話番号）:");
  logger.info(`  チェック対象（前回未登録）: ${totalChecked} 名`);
  logger.info(`  → 登録済みになった人（変化分）: ${registered} 名 (${rate}%)`);
  logger.info(`  → まだ未登録の人: ${notRegistered} 名`);
  if (summary.invalidPhone.length > 0) {
    logger.info(`  → 電話番号が不正で確認不可: ${summary.invalidPhone.length} 名`);
  }
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
