import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { ReservationStatus, ParticipationStatus, ParticipationStatusReason } from "@prisma/client";

const EXPECTED_MAP = {
  [ReservationStatus.APPLIED]: {
    status: ParticipationStatus.PENDING,
    reason: ParticipationStatusReason.RESERVATION_APPLIED,
  },
  [ReservationStatus.ACCEPTED]: {
    status: ParticipationStatus.PARTICIPATING,
    reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
  },
  [ReservationStatus.REJECTED]: {
    status: ParticipationStatus.NOT_PARTICIPATING,
    reason: ParticipationStatusReason.RESERVATION_REJECTED,
  },
  [ReservationStatus.CANCELED]: {
    status: ParticipationStatus.NOT_PARTICIPATING,
    reason: ParticipationStatusReason.RESERVATION_CANCELED,
  },
} as const;

export async function checkReservationParticipationConsistency() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

  logger.info("🔍 Checking reservation-participation consistency...");

  try {
    await issuer.internal(async (tx) => {
      const reservations = await tx.reservation.findMany({
        where: {
          status: {
            in: Object.keys(EXPECTED_MAP) as ReservationStatus[],
          },
        },
        include: {
          participations: true,
        },
      });

      const invalids = reservations.filter((r) => {
        const expected = EXPECTED_MAP[r.status];
        if (!r.participations || r.participations.length === 0) return true;

        return r.participations.some((p) => {
          return p.status !== expected.status || p.reason !== expected.reason;
        });
      });

      invalids.forEach((r) => {
        r.participations.forEach((p) => {
          const expected = EXPECTED_MAP[r.status];
          if (p.status !== expected.status || p.reason !== expected.reason) {
            logger.error("❌ Inconsistent reservation-participation pair", {
              reservationId: r.id,
              reservationStatus: r.status,
              participationId: p.id,
              actualStatus: p.status,
              actualReason: p.reason,
            });
          }
        });
      });

      logger.info(
        `🔎 Found ${invalids.length} inconsistent reservations out of ${reservations.length}.`,
      );
    });
  } catch (err) {
    logger.error("❌ Error while checking consistency", err);
  }
}

checkReservationParticipationConsistency()
  .then(() => {
    console.log("✅ Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to run batch:", err);
    process.exit(1);
  });
