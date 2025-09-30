import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { NmkrClient } from "../../src/infrastructure/libs/nmkr/api";
import { NftInstanceStatus, ProductType } from "@prisma/client";
import { CreateProjectRequest, UploadNftResponse } from "../../src/infrastructure/libs/nmkr/type";
import { UploadNftRequest } from "../../src/infrastructure/libs/nmkr/type";
import * as process from "node:process";
import fs from "fs";
import path from "path";
import { StripeClient } from "../../src/infrastructure/libs/stripe/client";

async function main() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nmkrClient = container.resolve(NmkrClient);
  const stripeClient = container.resolve(StripeClient);

  const NFTS_DIR = path.join(process.cwd(), "scripts/salesNft/nfts");

  const files = fs
    .readdirSync(NFTS_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort((a, b) => {
      const aNum = parseInt(a.replace(/\D/g, ""), 10);
      const bNum = parseInt(b.replace(/\D/g, ""), 10);
      return aNum - bNum;
    });

  /**
   * -------------------------------
   * 環境変数
   * -------------------------------
   */
  const PAYOUT_ADDR = process.env.NMKR_PAYOUT_ADDR ?? "addr_test1..."; // 売上送金先
  const DESCRIPTION = "デジタル住民証";

  /**
   * -------------------------------
   * 基本プロジェクト設定
   * -------------------------------
   */
  const COMMUNITY_ID = "neo88";

  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 13);
  const PROJECT_NAME = `KIBOTCHAスマートエコビレッジDAO-${timestamp}`; // プロジェクト名
  const PROJECT_IMG =
    "https://storage.googleapis.com/studio-design-asset-files/projects/BXaxJLbXO7/s-3534x2926_v-frms_webp_f7afab6f-3f7c-4067-8367-0991ab4d1651_small.webp";
  const PROJECT_URL = "https://dao.kibotcha.com/"; // 表示用URL
  const TOKEN_PREFIX = "KIBOTCHA"; // NFTのプレフィックス

  const PER_PRICE = 10000;
  const STATMENT_INVOICE = "KIBOTCHA DAO NFT";

  const MAX_SUPPLY = files.length; // 最大発行数（デフォルト 50）
  const POLICY_LOCKS = new Date("9999-12-31").toISOString(); // 実質無期限ポリシー

  /**
   * -------------------------------
   * 販売設定（Stripe決済のみ / 無料ミント）
   * -------------------------------
   */
  const SALE_START = new Date().toISOString(); // 販売開始
  const SALE_END = new Date("9999-12-31").toISOString(); // 販売終了（無期限）
  const PRICE_LIST = [
    {
      countNft: MAX_SUPPLY,
      price: 0, // 無料ミント
      currency: "ADA" as const,
      isActive: true,
      validFrom: SALE_START,
      validTo: SALE_END,
    },
  ];

  /**
   * -------------------------------
   * プロジェクト作成リクエスト
   * -------------------------------
   */
  const projectPayload: CreateProjectRequest = {
    projectname: PROJECT_NAME,
    description: DESCRIPTION,
    projecturl: PROJECT_URL,
    tokennamePrefix: TOKEN_PREFIX,
    policyExpires: true,
    policyLocksDateTime: POLICY_LOCKS,
    payoutWalletaddress: PAYOUT_ADDR,
    maxNftSupply: 1,
    addressExpiretime: 60, // 受取アドレスの有効期限（分単位）
    pricelist: PRICE_LIST,
    enableCardano: true,
  };

  /**
   * -------------------------------
   * プロジェクト作成実行
   * -------------------------------
   */
  let project;
  try {
    project = await nmkrClient.createProject(projectPayload);

    logger.info("✅ NMKR project created", {
      uid: project.uid,
      projectId: project.projectId,
      policyId: project.policyId,
    });
  } catch (err) {
    logger.error("❌ Failed to create NMKR project", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      details: err,
    });
    process.exit(1); // ここで終了（DBに中途半端に登録しない）
  }

  const stripeProduct = await stripeClient.createProduct({
    name: PROJECT_NAME, // 表示名
    active: true, // 販売可能状態
    description: DESCRIPTION,
    images: [PROJECT_IMG],
    metadata: {
      communityId: COMMUNITY_ID,
      projectUid: project.uid,
      policyId: project.policyId,
    },
    shippable: false,
    statement_descriptor: STATMENT_INVOICE,
    url: PROJECT_URL,
  });

  const stripePrice = await stripeClient.createPrice({
    currency: "jpy",
    unit_amount: PER_PRICE,
    product: stripeProduct.id,
    active: true,
    tax_behavior: "inclusive",
    metadata: {
      communityId: COMMUNITY_ID,
      projectUid: project.uid,
      policyId: project.policyId,
    },
  });

  logger.info("✅ Stripe product/price created", {
    stripeProductId: stripeProduct.id,
    stripePriceId: stripePrice.id,
  });

  /**
   * -------------------------------
   * DB 登録
   * -------------------------------
   */
  const product = await issuer.internal(async (tx) => {
    try {
      const product = await tx.product.create({
        data: {
          name: PROJECT_NAME,
          description: DESCRIPTION,
          price: PER_PRICE,
          maxSupply: MAX_SUPPLY,
          type: ProductType.NFT,
        },
      });

      await tx.nftProduct.create({
        data: {
          productId: product.id,
          nmkrProjectId: String(project.uid),
          policyId: project.policyId,
          stripeProductId: stripeProduct.id,
        },
      });

      logger.info("✅ Project registered in DB", {
        productId: product.id,
        nmkrProjectId: project.uid,
      });

      return product;
    } catch (err) {
      logger.error("❌ Failed to register project in DB", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      process.exit(1);
    }
  });

  /**
   * -------------------------------
   * NFT アップロード（複数）
   * -------------------------------
   */
  await issuer.internal(async (tx) => {
    const nftToken = await tx.nftToken.upsert({
      where: { address: project.policyId },
      update: {},
      create: {
        address: project.policyId,
        type: "CIP-25",
        name: PROJECT_NAME,
        symbol: TOKEN_PREFIX,
      },
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tokenname = `${String(i + 1).padStart(5, "0")}`;
      const displayname = `${PROJECT_NAME} #${i + 1}`;

      const fileBuffer = fs.readFileSync(path.join(NFTS_DIR, file));
      const base64 = fileBuffer.toString("base64");

      const nftPayload: UploadNftRequest = {
        tokenname,
        displayname,
        description: `NFT ${i + 1} for ${PROJECT_NAME}`,
        previewImageNft: {
          mimetype: "image/png",
          fileFromBase64: base64,
        },
        metadataPlaceholder: [{ name: "DESCRIPTION", value: `NFT ${i + 1} metadata` }],
      };

      let uploaded: UploadNftResponse;
      try {
        // -------------------------------
        // NMKR へのアップロード
        // -------------------------------
        uploaded = await nmkrClient.uploadNft(project.uid, nftPayload);

        logger.info("✅ NFT uploaded", {
          file,
          nftUid: uploaded.nftUid,
          assetId: uploaded.assetId,
        });
      } catch (err) {
        logger.error("❌ Failed to upload NFT to NMKR", {
          file,
          error: err instanceof Error ? err.message : String(err),
        });
        return; // DB登録に進まない
      }

      try {
        // -------------------------------
        // DB 登録
        // -------------------------------
        await tx.nftInstance.create({
          data: {
            instanceId: uploaded.nftUid,
            sequenceNum: i + 1,
            status: NftInstanceStatus.STOCK,
            name: displayname,
            description: nftPayload.description,
            imageUrl: `https://ipfs.io/ipfs/${uploaded.ipfsHashMainnft}`,
            json: uploaded.metadata ? JSON.parse(uploaded.metadata) : {},
            productId: product.id,
            communityId: COMMUNITY_ID,
            nftTokenId: nftToken.id,
          },
        });

        logger.info("✅ NFT registered in DB", {
          nftUid: uploaded.nftUid,
          productId: product.id,
        });
      } catch (err) {
        logger.error("❌ Failed to register NFT in DB", {
          file,
          nftUid: uploaded?.nftUid,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  });
}

main()
  .then(() => {
    logger.info("🎉 Script finished");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("❌ Script error", err);
    process.exit(1);
  });
