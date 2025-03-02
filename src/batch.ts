import logger from "@/infra/logging";

export async function batchProcess() {
  switch (process.env.BATCH_PROCESS_NAME) {
    case "sync-did-vc":
      return;
    case "send-line-messages":
      return;
    default:
      logger.error("Invalid batch process called.");
  }
}
