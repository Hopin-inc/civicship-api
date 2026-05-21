import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";

/**
 * `BATCH_PROCESS_NAME=request-did-vc` で起動される Cloud Run Job のエントリ。
 *
 * 旧 IDENTUS 連携で「Evaluation を見て DID/VC 発行リクエストを Pending 行に
 * 入れる」役割を担っていたが、内製化後は VC 発行は GraphQL mutation
 * (`issueVc`) で同期発行され、anchor は週次 batch (`sync-did-vc`) で
 * 一括処理されるため本エントリは不要。Cloud Scheduler job
 * `kyoso-dev-civicship-batch-scheduler-request-did-vc` を PAUSED のまま
 * 放置 / 削除する前提で no-op とする。
 *
 * 関連: docs/report/did-vc-internalization.md §5.3.1
 */
export async function requestDIDVC() {
  logger.warn(
    "[request-did-vc] deprecated entry — anchor batch は sync-did-vc に統合済み。" +
      "Cloud Scheduler の `request-did-vc` job は PAUSED のまま放置してください。",
  );
}
