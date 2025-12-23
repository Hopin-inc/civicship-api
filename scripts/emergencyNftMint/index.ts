import "reflect-metadata";
import "@/application/provider";
import * as process from "node:process";
import { container } from "tsyringe";
import * as path from "path";
import { PrismaClientIssuer } from "../../src/infrastructure/prisma/client";
import NFTWalletService from "../../src/application/domain/account/nft-wallet/service";
import logger from "../../src/infrastructure/logging";
import { IContext } from "../../src/types/server";
import { WalletResult } from "./types";
import { loadInputCsv } from "./csvParser";
import { processRecord } from "./walletCreator";
import { aggregateResults, writeOutputFiles, printSummary } from "./outputGenerator";

async function main() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nftWalletService = container.resolve(NFTWalletService);

  const INPUT_CSV_PATH = path.join(process.cwd(), "scripts/emergencyNftMint/input.csv");
  const OUTPUT_CSV_PATH = path.join(process.cwd(), "scripts/emergencyNftMint/output.csv");
  const ERROR_CSV_PATH = path.join(process.cwd(), "scripts/emergencyNftMint/errors.csv");
  const COMMUNITY_ID = process.env.EMERGENCY_NFT_COMMUNITY_ID || "default";

  const ctx = {
    communityId: COMMUNITY_ID,
    issuer,
  } as IContext;

  logger.info("Starting emergency NFT mint process...");
  logger.info("This script creates wallets for users based on phone numbers.");
  logger.info("MintService integration is done manually after this script completes.");

  const records = loadInputCsv(INPUT_CSV_PATH);

  const walletResults: WalletResult[] = [];
  for (const record of records) {
    try {
      const result = await processRecord(ctx, issuer, nftWalletService, record);
      walletResults.push(result);
    } catch (err) {
      logger.error(`Unexpected error processing record`, {
        phoneNumber: record.phoneNumber,
        nftSequence: record.nftSequence,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const processing = aggregateResults(walletResults);
  writeOutputFiles(processing, OUTPUT_CSV_PATH, ERROR_CSV_PATH);
  printSummary(processing, records.length);

  logger.info("");
  logger.info("Next steps:");
  logger.info(`  1. Review output CSV at: ${OUTPUT_CSV_PATH}`);
  logger.info("  2. Manually send walletAddress + nftSequence + name to MintService");
  logger.info(`  3. Review any errors at: ${ERROR_CSV_PATH}`);
}

main()
  .then(() => {
    logger.info("Script finished");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Script error", err);
    process.exit(1);
  });
