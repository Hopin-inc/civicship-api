import logger from "@/infrastructure/logging";
import { resizeImages } from "@/presentation/batch/resizeImages";
// import { checkReservationParticipationConsistency } from "@/presentation/batch/checkReservationParticipationConsistency";
// import { completeOpportunitySlots } from "@/presentation/batch/completeOpportunitySlots";
// import { syncDIDVC } from "src/presentation/batch/syncDIDVC";

export async function batchProcess() {
  switch (process.env.BATCH_PROCESS_NAME) {
    case "sync-did-vc":
      // await syncDIDVC();
      return;
    case "send-line-messages":
      return;
    case "check-reservation-participation-consistency":
      // await checkReservationParticipationConsistency();
      return;
    case "complete-opportunity-slots":
      // await completeOpportunitySlots();
      return;
    case "resize-images":
      await resizeImages();
      return;
    default:
      logger.error("Invalid batch process called.");
      return;
  }
}
