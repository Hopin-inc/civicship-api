import logger from "@/infrastructure/logging";
import { resizeImages } from "@/presentation/batch/resizeImages";
import { syncDIDVC } from "@/presentation/batch/syncDIDVCCompletion";

export async function batchProcess() {
  switch (process.env.BATCH_PROCESS_NAME) {
    case "sync-did-vc":
      await syncDIDVC();
      return;
    case "send-line-messages":
      return;
    case "resize-images":
      await resizeImages();
      return;
    default:
      logger.error("Invalid batch process called.");
      return;
  }
}
