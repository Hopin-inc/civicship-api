import "reflect-metadata";
import "@/application/provider";
import * as process from "node:process";
import { container } from "tsyringe";
import { NftInstanceStatus, NftMintStatus, Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "../../src/infrastructure/prisma/client";
import NFTWalletService from "../../src/application/domain/account/nft-wallet/service";
import logger from "../../src/infrastructure/logging";
import * as path from "path";
import * as fs from "fs";
import { IContext } from "@/types/server";

type MemberRecord = {
  nftNumber: number;
  phoneNumber: string;
};

type ProcessingResult = {
  success: number;
  nftNotFound: number[];
  userNotFound: Array<{ nftNumber: number; phoneNumber: string }>;
  walletCreationFailed: Array<{ nftNumber: number; phoneNumber: string; userId: string; error: string }>;
  alreadyAssigned: number[];
};

async function main() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nftWalletService = container.resolve(NFTWalletService);

  const MEMBER_CSV_PATH = path.join(process.cwd(), "scripts/salesNft/member.csv");
  const COMMUNITY_ID = process.env.COMMUNITY_ID || "neo88";

  const ctx: IContext = {
    userId: "system",
    communityId: COMMUNITY_ID,
    issuer,
  };

  logger.info("🚀 Starting NFT assignment and mint queue creation...");

  if (!fs.existsSync(MEMBER_CSV_PATH)) {
    logger.error(`❌ member.csv not found at ${MEMBER_CSV_PATH}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(MEMBER_CSV_PATH, "utf-8");
  const lines = csvContent.trim().split("\n");

  if (lines.length < 2) {
    logger.error("❌ member.csv is empty or has no data rows");
    process.exit(1);
  }

  const members: MemberRecord[] = lines.slice(1).map((line, index) => {
    const [nftNumber, phoneNumber] = line.split(",").map((s) => s.trim());
    if (!nftNumber || !phoneNumber) {
      logger.warn(`⚠️ Invalid CSV line ${index + 2}: ${line}`);
      return null;
    }
    return {
      nftNumber: parseInt(nftNumber, 10),
      phoneNumber,
    };
  }).filter((m): m is MemberRecord => m !== null);

  logger.info(`📋 Loaded ${members.length} records from member.csv`);

  const result: ProcessingResult = {
    success: 0,
    nftNotFound: [],
    userNotFound: [],
    walletCreationFailed: [],
    alreadyAssigned: [],
  };

  for (const member of members) {
    try {
      const nftInstance = await issuer.internal((tx) =>
        tx.nftInstance.findFirst({
          where: {
            sequenceNum: member.nftNumber,
            status: NftInstanceStatus.STOCK,
            communityId: COMMUNITY_ID,
          },
        }),
      );

      if (!nftInstance) {
        logger.warn(`⚠️ [nft_number=${member.nftNumber}] NFT instance not found or already assigned`);
        result.nftNotFound.push(member.nftNumber);
        continue;
      }

      if (nftInstance.nftWalletId) {
        logger.warn(`⚠️ [nft_number=${member.nftNumber}] NFT already assigned to wallet`);
        result.alreadyAssigned.push(member.nftNumber);
        continue;
      }

      const user = await issuer.public(ctx, (tx) =>
        tx.user.findFirst({
          where: { phoneNumber: member.phoneNumber },
        }),
      );

      if (!user) {
        logger.warn(`⚠️ [nft_number=${member.nftNumber}, phone=${member.phoneNumber}] User not found`);
        result.userNotFound.push({
          nftNumber: member.nftNumber,
          phoneNumber: member.phoneNumber,
        });
        continue;
      }

      let wallet;
      try {
        wallet = await nftWalletService.ensureNmkrWallet(ctx, user.id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(
          `❌ [nft_number=${member.nftNumber}, phone=${member.phoneNumber}, userId=${user.id}] Wallet creation failed: ${errorMessage}`,
        );
        result.walletCreationFailed.push({
          nftNumber: member.nftNumber,
          phoneNumber: member.phoneNumber,
          userId: user.id,
          error: errorMessage,
        });
        continue;
      }

      await issuer.internal(async (tx) => {
        await tx.nftInstance.update({
          where: { id: nftInstance.id },
          data: { nftWalletId: wallet.id },
        });

        await tx.nftMint.create({
          data: {
            status: NftMintStatus.QUEUED,
            nftWalletId: wallet.id,
            nftInstanceId: nftInstance.id,
          },
        });
      });

      logger.info(
        `✅ [nft_number=${member.nftNumber}, phone=${member.phoneNumber}, userId=${user.id}] Assigned and queued for minting`,
      );
      result.success++;
    } catch (err) {
      logger.error(
        `❌ [nft_number=${member.nftNumber}] Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logger.info("📊 Processing Summary:");
  logger.info(`  Total records in CSV: ${members.length}`);
  logger.info(`  Successfully processed: ${result.success}`);
  logger.info(`  Skipped (NFT not found): ${result.nftNotFound.length}`);
  logger.info(`  Skipped (User not found): ${result.userNotFound.length}`);
  logger.info(`  Skipped (Already assigned): ${result.alreadyAssigned.length}`);
  logger.info(`  Failed (Wallet creation error): ${result.walletCreationFailed.length}`);
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (result.nftNotFound.length > 0) {
    logger.info(`📋 NFTs not found: [${result.nftNotFound.join(", ")}]`);
  }

  if (result.alreadyAssigned.length > 0) {
    logger.info(`📋 NFTs already assigned: [${result.alreadyAssigned.join(", ")}]`);
  }

  if (result.userNotFound.length > 0) {
    logger.info("📋 Users not found:");
    result.userNotFound.forEach((item) => {
      logger.info(`  - nft_number: ${item.nftNumber}, phone: ${item.phoneNumber}`);
    });
  }

  if (result.walletCreationFailed.length > 0) {
    logger.info("📋 Wallet creation failures:");
    result.walletCreationFailed.forEach((item) => {
      logger.info(
        `  - nft_number: ${item.nftNumber}, phone: ${item.phoneNumber}, userId: ${item.userId}, error: ${item.error}`,
      );
    });
  }

  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logger.info(`🎉 Successfully queued ${result.success} NFTs for minting`);
}

main()
  .then(() => {
    logger.info("✅ Script finished");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("❌ Script error", err);
    process.exit(1);
  });
