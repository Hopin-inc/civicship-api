import logger from "@/infrastructure/logging";
import { resizeImages } from "@/presentation/batch/resizeImages";
import { checkReservationParticipationConsistency } from "@/presentation/batch/checkReservationParticipationConsistency";
import { completeOpportunitySlots } from "@/presentation/batch/completeOpportunitySlots";
import { syncDIDVC } from "@/presentation/batch/syncDIDVC";
import { syncNftMetadata } from "@/presentation/batch/syncNftMetadata";

export async function batchProcess() {
  switch (process.env.BATCH_PROCESS_NAME) {
    case "sync-did-vc":
      await syncDIDVC();
      return;
    case "check-reservation-participation-consistency":
      await checkReservationParticipationConsistency();
      return;
    case "complete-opportunity-slots":
      await completeOpportunitySlots();
      return;
    case "resize-images":
      await resizeImages();
      return;
    case "sync-nft-metadata":
      await syncNftMetadata();
      return;
    default:
      logger.error("Invalid batch process called.");
      return;
  }
}
