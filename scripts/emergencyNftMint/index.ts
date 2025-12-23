import "reflect-metadata";
import "@/application/provider";
import * as process from "node:process";
import { container } from "tsyringe";
import * as path from "path";
import * as fs from "fs";
import { PrismaClientIssuer } from "../../src/infrastructure/prisma/client";
import NFTWalletService from "../../src/application/domain/account/nft-wallet/service";
import logger from "../../src/infrastructure/logging";
import { auth } from "../../src/infrastructure/libs/firebase";
import { IContext } from "../../src/types/server";

type InputRecord = {
  phoneNumber: string;
  nftSequence: number;
  name: string;
};

type ProcessingResult = {
  success: Array<{
    phoneNumber: string;
    nftSequence: number;
    walletAddress: string;
    firebaseUid: string;
    userId: string;
    isConfirmed: boolean;
  }>;
  firebaseNotFound: Array<{ phoneNumber: string; nftSequence: number; name: string }>;
  walletCreationFailed: Array<{
    phoneNumber: string;
    nftSequence: number;
    firebaseUid: string;
    error: string;
  }>;
};

async function findOrCreateUserByFirebaseUid(
  issuer: PrismaClientIssuer,
  firebaseUid: string,
): Promise<{ id: string; isConfirmed: boolean }> {
  return await issuer.internal(async (tx) => {
    const existingIdentity = await tx.identity.findFirst({
      where: { uid: firebaseUid },
      include: { user: true },
    });

    if (existingIdentity?.user) {
      const isConfirmed = existingIdentity.refreshToken !== null;
      logger.debug(`Found existing user for Firebase UID`, {
        firebaseUid,
        userId: existingIdentity.user.id,
        isConfirmed,
      });
      return { id: existingIdentity.user.id, isConfirmed };
    }

    logger.debug(`Creating new user for Firebase UID`, { firebaseUid });
    const newUser = await tx.user.create({
      data: {
        name: "名前未設定",
        slug: "名前未設定",
        currentPrefecture: "UNKNOWN",
        identities: {
          create: [
            {
              uid: firebaseUid,
              platform: "PHONE",
            },
          ],
        },
      },
    });

    return { id: newUser.id, isConfirmed: false };
  });
}

function generateOutputCsv(
  results: ProcessingResult,
  outputPath: string,
  errorOutputPath: string,
): void {
  const successRecords = results.success;
  const outputCsvContent =
    "walletAddress,nftSequence\n" +
    successRecords.map((r) => `${r.walletAddress},${r.nftSequence}`).join("\n");

  fs.writeFileSync(outputPath, outputCsvContent, "utf-8");
  logger.info(`Output CSV written to ${outputPath}`, {
    recordCount: successRecords.length,
  });

  const errorRecords = [
    ...results.firebaseNotFound.map((r) => ({
      phoneNumber: r.phoneNumber,
      nftSequence: r.nftSequence,
      name: r.name,
      errorType: "FIREBASE_NOT_FOUND",
      error: "Phone number not found in Firebase",
    })),
    ...results.walletCreationFailed.map((r) => ({
      phoneNumber: r.phoneNumber,
      nftSequence: r.nftSequence,
      name: "",
      errorType: "WALLET_CREATION_FAILED",
      error: r.error,
    })),
  ];

  if (errorRecords.length > 0) {
    const errorCsvContent =
      "phoneNumber,nftSequence,name,errorType,error\n" +
      errorRecords
        .map(
          (r) =>
            `${r.phoneNumber},${r.nftSequence},${r.name},${r.errorType},"${r.error.replace(/"/g, '""')}"`,
        )
        .join("\n");

    fs.writeFileSync(errorOutputPath, errorCsvContent, "utf-8");
    logger.info(`Error CSV written to ${errorOutputPath}`, {
      recordCount: errorRecords.length,
    });
  }
}

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

  if (!fs.existsSync(INPUT_CSV_PATH)) {
    logger.error(`Input CSV not found at ${INPUT_CSV_PATH}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(INPUT_CSV_PATH, "utf-8");
  const lines = csvContent.trim().split("\n");

  if (lines.length < 2) {
    logger.error("Input CSV is empty or has no data rows");
    process.exit(1);
  }

  const records: InputRecord[] = lines
    .slice(1)
    .map((line, index) => {
      const [phoneNumber, nftSequence, name] = line.split(",").map((s) => s.trim());
      if (!phoneNumber || !nftSequence) {
        logger.warn(`Invalid CSV line ${index + 2}: ${line}`);
        return null;
      }
      return {
        phoneNumber,
        nftSequence: parseInt(nftSequence, 10),
        name: name || "",
      };
    })
    .filter((r): r is InputRecord => r !== null);

  logger.info(`Loaded ${records.length} records from input CSV`);

  const result: ProcessingResult = {
    success: [],
    firebaseNotFound: [],
    walletCreationFailed: [],
  };

  for (const record of records) {
    try {
      logger.debug(`Processing record`, {
        phoneNumber: record.phoneNumber,
        nftSequence: record.nftSequence,
      });

      let firebaseUid: string;
      try {
        const userRecord = await auth.getUserByPhoneNumber(record.phoneNumber);
        firebaseUid = userRecord.uid;
        logger.debug(`Found Firebase user`, {
          phoneNumber: record.phoneNumber,
          firebaseUid,
        });
      } catch (err) {
        logger.warn(`Firebase user not found for phone number`, {
          phoneNumber: record.phoneNumber,
          error: err instanceof Error ? err.message : String(err),
        });
        result.firebaseNotFound.push({
          phoneNumber: record.phoneNumber,
          nftSequence: record.nftSequence,
          name: record.name,
        });
        continue;
      }

      const { id: userId, isConfirmed } = await findOrCreateUserByFirebaseUid(
        issuer,
        firebaseUid,
      );

      let wallet;
      try {
        wallet = await nftWalletService.ensureNmkrWallet(ctx, userId);
        logger.debug(`Wallet ensured`, {
          userId,
          walletAddress: wallet.walletAddress,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(`Wallet creation failed`, {
          phoneNumber: record.phoneNumber,
          firebaseUid,
          error: errorMessage,
        });
        result.walletCreationFailed.push({
          phoneNumber: record.phoneNumber,
          nftSequence: record.nftSequence,
          firebaseUid,
          error: errorMessage,
        });
        continue;
      }

      result.success.push({
        phoneNumber: record.phoneNumber,
        nftSequence: record.nftSequence,
        walletAddress: wallet.walletAddress,
        firebaseUid,
        userId,
        isConfirmed,
      });

      logger.info(`Successfully processed`, {
        phoneNumber: record.phoneNumber,
        nftSequence: record.nftSequence,
        walletAddress: wallet.walletAddress,
        isConfirmed,
      });
    } catch (err) {
      logger.error(`Unexpected error processing record`, {
        phoneNumber: record.phoneNumber,
        nftSequence: record.nftSequence,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  generateOutputCsv(result, OUTPUT_CSV_PATH, ERROR_CSV_PATH);

  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logger.info("Processing Summary:");
  logger.info(`  Total records in CSV: ${records.length}`);
  logger.info(`  Successfully processed: ${result.success.length}`);
  logger.info(`    - Confirmed users: ${result.success.filter((r) => r.isConfirmed).length}`);
  logger.info(`    - Unconfirmed users: ${result.success.filter((r) => !r.isConfirmed).length}`);
  logger.info(`  Skipped (Firebase not found): ${result.firebaseNotFound.length}`);
  logger.info(`  Failed (Wallet creation): ${result.walletCreationFailed.length}`);
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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
