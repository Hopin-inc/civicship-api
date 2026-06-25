import "reflect-metadata";
import "@/application/provider";
import * as process from "node:process";
import * as path from "path";
import logger from "../../../src/infrastructure/logging";
import { loadCheckCsv } from "./helpers/csvParser";
import { checkAll } from "./helpers/checker";
import { aggregate, writeOutputFiles, printSummary } from "./helpers/outputGenerator";

/**
 * 登録状況チェック（確認専用 / 副作用なし）
 *
 * 前回の Errors CSV（または元の input.csv）を入力に、各電話番号が今 Firebase に
 * 登録されているかだけを確認し、「登録済みになった人（変化分）」と「まだ未登録の人」を
 * 集計・CSV出力する。ウォレット作成やDB書き込みは一切行わない。
 *
 * 使い方:
 *   pnpm emergency:check-registration [入力CSVパス] [出力ディレクトリ]
 *   - 入力CSVパス省略時: scripts/emergency/checkRegistration/input.csv
 *   - 出力ディレクトリ省略時: scripts/emergency/checkRegistration/output
 */
async function main() {
  const baseDir = path.join(process.cwd(), "scripts/emergency/checkRegistration");
  const inputPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(baseDir, "input.csv");
  const outputDir = process.argv[3]
    ? path.resolve(process.cwd(), process.argv[3])
    : path.join(baseDir, "output");

  logger.info("登録状況チェックを開始します（確認専用・副作用なし）");
  logger.info(`入力CSV: ${inputPath}`);
  logger.info(`出力先: ${outputDir}`);

  const records = loadCheckCsv(inputPath);
  const results = await checkAll(records);
  const summary = aggregate(results);

  writeOutputFiles(summary, outputDir);
  printSummary(summary, records.length);

  logger.info("");
  logger.info("次のステップ:");
  logger.info(`  1. 変化分（登録済みになった人）: ${path.join(outputDir, "registered.csv")}`);
  logger.info(`  2. まだ未登録の人: ${path.join(outputDir, "still-not-registered.csv")}`);
  logger.info(
    "  ※ このスクリプトはウォレット作成・DB更新を行いません。実際のミントは別途実施してください。",
  );
}

main()
  .then(() => {
    logger.info("スクリプトが完了しました");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("スクリプトエラー", err);
    process.exit(1);
  });
