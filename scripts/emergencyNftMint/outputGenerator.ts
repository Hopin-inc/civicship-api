import * as fs from "fs";
import logger from "../../src/infrastructure/logging";
import { ProcessingResult, WalletResult } from "./types";

export function aggregateResults(results: WalletResult[]): ProcessingResult {
  const processing: ProcessingResult = {
    success: [],
    firebaseNotFound: [],
    userNotFound: [],
    walletCreationFailed: [],
  };

  for (const result of results) {
    switch (result.kind) {
      case "success":
        processing.success.push(result);
        break;
      case "firebaseNotFound":
        processing.firebaseNotFound.push(result);
        break;
      case "userNotFound":
        processing.userNotFound.push(result);
        break;
      case "walletCreationFailed":
        processing.walletCreationFailed.push(result);
        break;
    }
  }

  return processing;
}

export function buildOutputCsv(processing: ProcessingResult): string {
  const lines = processing.success.map((r) => `${r.walletAddress},${r.nftSequence},${r.name}`);
  return ["walletAddress,nftSequence,name", ...lines].join("\n");
}

export function buildErrorCsv(processing: ProcessingResult): string | null {
  const errorRecords = [
    ...processing.firebaseNotFound.map((r) => ({
      phoneNumber: r.phoneNumber,
      nftSequence: r.nftSequence,
      name: r.name,
      errorType: "FIREBASE_NOT_FOUND",
      error: r.error,
    })),
    ...processing.userNotFound.map((r) => ({
      phoneNumber: r.phoneNumber,
      nftSequence: r.nftSequence,
      name: r.name,
      errorType: "USER_NOT_FOUND",
      error: "Civicship user not found",
    })),
    ...processing.walletCreationFailed.map((r) => ({
      phoneNumber: r.phoneNumber,
      nftSequence: r.nftSequence,
      name: r.name,
      errorType: "WALLET_CREATION_FAILED",
      error: r.error,
    })),
  ];

  if (errorRecords.length === 0) {
    return null;
  }

  const lines = errorRecords.map(
    (r) =>
      `${r.phoneNumber},${r.nftSequence},${r.name},${r.errorType},"${r.error.replace(/"/g, '""')}"`,
  );
  return ["phoneNumber,nftSequence,name,errorType,error", ...lines].join("\n");
}

export function writeOutputFiles(
  processing: ProcessingResult,
  outputPath: string,
  errorOutputPath: string,
): void {
  const outputCsv = buildOutputCsv(processing);
  fs.writeFileSync(outputPath, outputCsv, "utf-8");
  logger.info(`Output CSV written to ${outputPath}`, {
    recordCount: processing.success.length,
  });

  const errorCsv = buildErrorCsv(processing);
  if (errorCsv) {
    fs.writeFileSync(errorOutputPath, errorCsv, "utf-8");
    logger.info(`Error CSV written to ${errorOutputPath}`, {
      recordCount:
        processing.firebaseNotFound.length +
        processing.userNotFound.length +
        processing.walletCreationFailed.length,
    });
  }
}

export function printSummary(processing: ProcessingResult, totalRecords: number): void {
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logger.info("Processing Summary:");
  logger.info(`  Total records in CSV: ${totalRecords}`);
  logger.info(`  Successfully processed: ${processing.success.length}`);
  logger.info(`  Skipped (Firebase not found): ${processing.firebaseNotFound.length}`);
  logger.info(`  Skipped (Civicship user not found): ${processing.userNotFound.length}`);
  logger.info(`  Failed (Wallet creation): ${processing.walletCreationFailed.length}`);
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
