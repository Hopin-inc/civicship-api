import "reflect-metadata";
import "@/application/provider";
import * as process from "node:process";
import { container } from "tsyringe";
import { NftInstanceStatus, Prisma } from "@prisma/client";
import { NmkrClient } from "../../src/infrastructure/libs/nmkr/api";
import { CreateProjectRequest, UploadNftRequest } from "../../src/infrastructure/libs/nmkr/type";
import { PrismaClientIssuer } from "../../src/infrastructure/prisma/client";
import logger from "../../src/infrastructure/logging";
import * as path from "path";
import * as fs from "fs";

async function main() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nmkrClient = container.resolve(NmkrClient);

  const NFTS_DIR = path.join(process.cwd(), "scripts/salesNft/nfts");

  const files = fs
    .readdirSync(NFTS_DIR)
    .filter((f) => f.endsWith(".jpg"))
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
  const PROJECT_URL = "https://dao.kibotcha.com/"; // 表示用URL
  const TOKEN_PREFIX = "KIBOTCHA"; // NFTのプレフィックス

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

  /**
   * -------------------------------
   * DB 登録
   * -------------------------------
   */
  const { nftToken } = await issuer.internal(async (tx) => {
    // Policy（nftToken）は upsert で作成/更新
    const nftToken = await tx.nftToken.upsert({
      where: { address: project.policyId },
      update: {
        json: {
          nmkrProjectUid: project.uid,
          policyScript: project.policyScript ? JSON.parse(project.policyScript) : null,
          policyExpiration: project.policyExpiration,
          enabledCoins: project.enabledCoins?.trim().split(/\s+/) ?? [],
          metadataTemplate: project.metadata ? JSON.parse(project.metadata) : null,
          metadataTemplateMultiChain: {
            aptos: project.metadataTemplateAptos,
            solana: project.metadataTemplateSolana,
          },
        } as Prisma.JsonObject,
      },
      create: {
        address: project.policyId,
        type: "CIP-25",
        name: PROJECT_NAME,
        symbol: TOKEN_PREFIX,
        json: {
          nmkrProjectUid: project.uid,
          policyScript: project.policyScript ? JSON.parse(project.policyScript) : null,
          policyExpiration: project.policyExpiration,
          enabledCoins: project.enabledCoins?.trim().split(/\s+/) ?? [],
          metadataTemplate: project.metadata ? JSON.parse(project.metadata) : null,
          metadataTemplateMultiChain: {
            aptos: project.metadataTemplateAptos,
            solana: project.metadataTemplateSolana,
          },
        } as Prisma.JsonObject,
      },
    });

    return { nftToken };
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
        json: (() => {
          try {
            return uploaded.metadata ? JSON.parse(uploaded.metadata) : {};
          } catch {
            return {};
          }
        })(),
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
        nftTokenId: nftToken.id,
        communityId: COMMUNITY_ID,
      })),
      skipDuplicates: true, // idempotent 実行を許容（再実行に強い）
    });

    logger.info("✅ All NFT instances registered in DB", {
      count: uploadedItems.length,
      nftTokenId: nftToken.id,
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
