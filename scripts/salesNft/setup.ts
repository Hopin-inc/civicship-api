import "reflect-metadata";
import "@/application/provider";
import * as process from "node:process";
import { container } from "tsyringe";
import { NftInstanceStatus, Prisma, ProductType } from "@prisma/client";
import { NmkrClient } from "../../src/infrastructure/libs/nmkr/api";
import { StripeClient } from "../../src/infrastructure/libs/stripe/client";
import { CreateProjectRequest, UploadNftRequest } from "../../src/infrastructure/libs/nmkr/type";
import { PrismaClientIssuer } from "../../src/infrastructure/prisma/client";
import logger from "../../src/infrastructure/logging";
import * as path from "path";
import * as fs from "fs";

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
  const STATEMENT_INVOICE = "KIBOTCHA DAO NFT";

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
    statement_descriptor: STATEMENT_INVOICE,
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
  // 1) Product, Integration, NftToken, NftProduct を先に作成（DB整備）
  const { nftProduct } = await issuer.internal(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: PROJECT_NAME,
        description: DESCRIPTION,
        price: PER_PRICE,
        maxSupply: MAX_SUPPLY,
        type: ProductType.NFT,
        integrations: {
          create: [
            { provider: "STRIPE", externalRef: stripeProduct.id },
            { provider: "NMKR", externalRef: project.uid },
          ],
        },
      },
      include: { integrations: true },
    });

    // Policy（nftToken）は connectOrCreate で作成/接続
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

    const nftProduct = await tx.nftProduct.create({
      data: { productId: product.id, nftTokenId: nftToken.id },
    });

    return { nftProduct };
  });

  // 2) NMKR へ “全件” アップロード（DBはまだ触らない）
  type UploadedItem = {
    instanceId: string;
    sequenceNum: number;
    name: string;
    description: string;
    imageUrl: string;
    json: Record<string, unknown>;
  };

  const uploadedItems: UploadedItem[] = [];
  const failures: Array<{ file: string; error: string }> = [];

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
      previewImageNft: { mimetype: "image/png", fileFromBase64: base64 },
      metadataPlaceholder: [{ name: "DESCRIPTION", value: `NFT ${i + 1} metadata` }],
    };

    try {
      const uploaded = await nmkrClient.uploadNft(project.uid, nftPayload);

      logger.info("✅ NFT uploaded", {
        file,
        nftUid: uploaded.nftUid,
        assetId: uploaded.assetId,
      });

      uploadedItems.push({
        instanceId: uploaded.nftUid,
        sequenceNum: i + 1,
        name: displayname,
        description: nftPayload.description!,
        imageUrl: `https://ipfs.io/ipfs/${uploaded.ipfsHashMainnft}`,
        json: uploaded.metadata ? JSON.parse(uploaded.metadata) : {},
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push({ file, error: message });
      logger.error("❌ Failed to upload NFT to NMKR", { file, error: message });
    }
  }

  // 3) 失敗が1件でもあれば “DBは一切書かず” に終わる（不整合を避ける）
  if (failures.length > 0) {
    logger.error("❌ NMKR upload failed for some items", {
      failures: JSON.stringify(failures, null, 2),
    });
    throw new Error("NMKR upload failed for some items");
  }

  // 4) 全件成功したら “1トランザクションでDB一括” 反映
  await issuer.internal(async (tx) => {
    // createMany で一括登録（Prisma 6系なら JSON 列も OK）
    await tx.nftInstance.createMany({
      data: uploadedItems.map((u) => ({
        instanceId: u.instanceId,
        sequenceNum: u.sequenceNum,
        status: NftInstanceStatus.STOCK,
        name: u.name,
        description: u.description,
        imageUrl: u.imageUrl,
        json: u.json as Prisma.JsonObject,
        nftProductId: nftProduct.id,
        communityId: COMMUNITY_ID,
      })),
      skipDuplicates: true, // idempotent 実行を許容（再実行に強い）
    });

    logger.info("✅ All NFT instances registered in DB", {
      count: uploadedItems.length,
      nftProductId: nftProduct.id,
    });
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
