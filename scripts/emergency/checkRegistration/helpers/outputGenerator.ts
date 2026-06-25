import * as fs from "fs";
import * as path from "path";
import logger from "../../../../src/infrastructure/logging";
import { CheckResult, CheckSummary } from "../types";

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

function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

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
