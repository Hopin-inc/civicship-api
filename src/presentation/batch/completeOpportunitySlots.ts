import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { OpportunitySlotHostingStatus, ReservationStatus } from "@prisma/client";
import { endOfDay } from "date-fns";

/**
 * 🧹 Auto-completion batch for opportunitySlot
 *
 * This batch identifies all opportunity slots that:
 * - have `hostingStatus = SCHEDULED`
 * - have `startsAt <= today` (i.e. today or any past date)
 * - have at least one reservation with `status = ACCEPTED`
 *
 * and updates their `hostingStatus` to `COMPLETED`.
 *
 * This ensures that overdue or expired opportunity slots
 * are marked appropriately in the system.
 */
export async function completeOpportunitySlots() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

  logger.info("🕓 Starting opportunity slot auto-completion batch...");

  const todayEnd = endOfDay(new Date()); // Local time (JST) assumed

  try {
    const result = await issuer.internal(async (tx) => {
      const targets = await tx.opportunitySlot.findMany({
        where: {
          hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
          startsAt: {
            lte: todayEnd,
          },
          reservations: {
            some: {
              status: ReservationStatus.ACCEPTED,
            },
          },
        },
      });

      logger.info(
        `🎯 Found ${targets.length} slots to complete (startsAt <= today & has ACCEPTED reservation)`,
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

    logger.info(`✅ Completed ${result.updatedCount} out of ${result.total} scheduled slots.`);
  } catch (error) {
    logger.error("❌ Error in opportunity slot completion batch:", error);
  }
}

/**
 * Run the batch script as a CLI entrypoint.
 */
completeOpportunitySlots()
  .then(() => {
    console.log("✅ Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    process.exit(1);
  });
