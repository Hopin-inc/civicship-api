import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import AnchorBatchUseCase from "@/application/domain/anchor/anchorBatch/usecase";
import { IContext } from "@/types/server";

/**
 * `BATCH_PROCESS_NAME=sync-did-vc` で起動される Cloud Run Job のエントリ。
 *
 * 旧 IDENTUS 連携の sync ロジックは内製化に伴い廃止。本関数は新しい
 * `AnchorBatchUseCase.runBatch` を呼び出し、週次 Cardano anchor バッチを
 * 実行する単一の epoch を構成する (§5.3.1)。
 *
 * 既存の Cloud Scheduler job `kyoso-dev-civicship-batch-scheduler-sync-did-vc`
 * を再利用するため、エントリポイント名 (`syncDIDVC`) と batch case 名
 * (`sync-did-vc`) は据え置く。
 */
export async function syncDIDVC() {
  logger.info("[sync-did-vc] starting weekly anchor batch");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const usecase = container.resolve(AnchorBatchUseCase);
  const ctx = { issuer } as IContext;

  try {
    const result = await usecase.runBatch(ctx, {});
    logger.info("[sync-did-vc] anchor batch completed", { result });
  } catch (err) {
    logger.error("[sync-did-vc] anchor batch failed", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
}
