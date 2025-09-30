import "reflect-metadata";
import { container } from "tsyringe";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api";
import logger from "@/infrastructure/logging";

async function main() {
  const client = container.resolve(NmkrClient);
  const nftUid = "f8082203-86d8-4c8f-8b1a-ff39c617bc39";

  logger.info("🔍 Starting NFT details fetch batch...");

  try {
    const details = await client.getNftDetails(nftUid);
    logger.info("✅ Successfully fetched NFT details", { nftUid });
    logger.debug("📦 NFT Details:", details);
  } catch (error) {
    logger.error("❌ Error fetching NFT details", { nftUid, error });
    throw error;
  }

  logger.info("🏁 NFT details fetch batch completed.");
}

main()
  .then(() => {
    logger.info("🎉 Batch finished successfully");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("💥 Batch failed:", err);
    process.exit(1);
  });
