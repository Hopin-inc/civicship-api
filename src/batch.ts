import logger from "@/infrastructure/logging";
import { resizeImages } from "@/presentation/batch/resizeImages";

export async function batchProcess() {
  switch (process.env.BATCH_PROCESS_NAME) {
    case "sync-did-vc":
      return;
    case "send-line-messages":
      return;
    case "resize-images":
      return resizeImages();
    default:
      logger.error("Invalid batch process called.");
      return;
  }
}
