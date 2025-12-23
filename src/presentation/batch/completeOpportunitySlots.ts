import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { OpportunitySlotHostingStatus } from "@prisma/client";
import { endOfDay } from "date-fns";

/**
 * 🧹 Auto-completion batch for opportunitySlot
 *
 * This batch identifies all opportunity slots that:
 * - have `hostingStatus = SCHEDULED`
 * - have `startsAt <= today` (i.e. today or any past date)
 *
 * and updates their `hostingStatus` to `COMPLETED`.
 *
 * This ensures that overdue or expired opportunity slots
 * are marked appropriately in the system.
 */
export async function completeOpportunitySlots() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

  logger.debug("🕓 Starting opportunity slot auto-completion batch...");

  const todayEnd = endOfDay(new Date()); // Local time (JST) assumed

  try {
    const result = await issuer.internal(async (tx) => {
      const targets = await tx.opportunitySlot.findMany({
        where: {
          hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
          startsAt: {
            lte: todayEnd,
          },
        },
      });

      logger.debug(
        `🎯 Found ${targets.length} slots to complete (startsAt <= today)`,
      );

      const updates = await Promise.all(
        targets.map((slot) =>
          tx.opportunitySlot.update({
            where: { id: slot.id },
            data: {
              hostingStatus: OpportunitySlotHostingStatus.COMPLETED,
            },
          }),
        ),
      );

      return {
        total: targets.length,
        updatedCount: updates.length,
      };
    });

    logger.debug(`✅ Completed ${result.updatedCount} out of ${result.total} scheduled slots.`);
  } catch (error) {
    logger.error("❌ Error in opportunity slot completion batch:", error);
  }
}
