import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { ReservationStatus, ParticipationStatus, ParticipationStatusReason } from "@prisma/client";

type Reservation = {
  id: string;
  status: ReservationStatus;
};

type Participation = {
  id: string;
  status: ParticipationStatus;
  reason: ParticipationStatusReason;
  evaluationId: string | null;
};

/**
 * Validates the consistency between reservation and participation states.
 * Returns an array of validation error messages (empty if valid).
 */
function validateConsistency(
  reservation: Reservation,
  participation: Participation,
): string[] {
  const errors: string[] = [];
  const hasEvaluation = !!participation.evaluationId;

  // Rule 1: Validate reason-reservationStatus consistency
  const reasonStatusMap: Record<string, ReservationStatus> = {
    [ParticipationStatusReason.RESERVATION_APPLIED]: ReservationStatus.APPLIED,
    [ParticipationStatusReason.RESERVATION_ACCEPTED]: ReservationStatus.ACCEPTED,
    [ParticipationStatusReason.RESERVATION_REJECTED]: ReservationStatus.REJECTED,
    [ParticipationStatusReason.RESERVATION_CANCELED]: ReservationStatus.CANCELED,
  };

  const expectedReservationStatus = reasonStatusMap[participation.reason];
  if (
    expectedReservationStatus &&
    expectedReservationStatus !== reservation.status &&
    participation.reason !== ParticipationStatusReason.OPPORTUNITY_CANCELED
  ) {
    errors.push(
      `Reason ${participation.reason} conflicts with reservation status ${reservation.status} (expected ${expectedReservationStatus})`,
    );
  }

  // Rule 2: Evaluated participations cannot be PENDING or PARTICIPATING
  if (hasEvaluation && [ParticipationStatus.PENDING, ParticipationStatus.PARTICIPATING].includes(participation.status)) {
    errors.push(
      `Evaluated participation cannot be ${participation.status}`,
    );
  }

  // Rule 3: Validate ACCEPTED reservation states
  if (
    reservation.status === ReservationStatus.ACCEPTED &&
    participation.reason === ParticipationStatusReason.RESERVATION_ACCEPTED
  ) {
    if (hasEvaluation) {
      // After evaluation: PARTICIPATED or NOT_PARTICIPATING (if canceled) is allowed
      if (
        ![ParticipationStatus.PARTICIPATED, ParticipationStatus.NOT_PARTICIPATING].includes(
          participation.status,
        )
      ) {
        errors.push(
          `ACCEPTED reservation with evaluation expects PARTICIPATED or NOT_PARTICIPATING, got ${participation.status}`,
        );
      }
    } else {
      // Before evaluation: PARTICIPATING or NOT_PARTICIPATING (if canceled) is allowed
      if (
        ![ParticipationStatus.PARTICIPATING, ParticipationStatus.NOT_PARTICIPATING].includes(
          participation.status,
        )
      ) {
        errors.push(
          `ACCEPTED reservation without evaluation expects PARTICIPATING or NOT_PARTICIPATING, got ${participation.status}`,
        );
      }
    }
  }

  // Rule 4: APPLIED reservations should have PENDING or NOT_PARTICIPATING status
  if (
    reservation.status === ReservationStatus.APPLIED &&
    participation.reason === ParticipationStatusReason.RESERVATION_APPLIED
  ) {
    if (
      ![ParticipationStatus.PENDING, ParticipationStatus.NOT_PARTICIPATING].includes(
        participation.status,
      )
    ) {
      errors.push(
        `APPLIED reservation expects PENDING or NOT_PARTICIPATING, got ${participation.status}`,
      );
    }
  }

  // Rule 5: REJECTED/CANCELED reservations must have NOT_PARTICIPATING status
  if ([ReservationStatus.REJECTED, ReservationStatus.CANCELED].includes(reservation.status)) {
    if (participation.status !== ParticipationStatus.NOT_PARTICIPATING) {
      errors.push(
        `${reservation.status} reservation must have NOT_PARTICIPATING status, got ${participation.status}`,
      );
    }
  }

  return errors;
}

export async function checkReservationParticipationConsistency() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

  logger.info("🔍 Checking reservation-participation consistency...");

  try {
    await issuer.internal(async (tx) => {
      const reservations = await tx.reservation.findMany({
        include: {
          participations: true,
        },
      });

      let totalErrors = 0;
      let reservationsWithErrors = 0;

      reservations.forEach((r) => {
        if (!r.participations || r.participations.length === 0) {
          logger.warn("⚠️ Reservation has no participations", {
            reservationId: r.id,
            reservationStatus: r.status,
          });
          return;
        }

        let hasErrors = false;

        r.participations.forEach((p) => {
          const validationErrors = validateConsistency(r, p);

          if (validationErrors.length > 0) {
            hasErrors = true;
            totalErrors += validationErrors.length;

            logger.error("❌ Inconsistent reservation-participation pair", {
              reservationId: r.id,
              reservationStatus: r.status,
              participationId: p.id,
              participationStatus: p.status,
              participationReason: p.reason,
              hasEvaluation: !!p.evaluationId,
              violations: validationErrors,
            });
          }
        });

        if (hasErrors) {
          reservationsWithErrors++;
        }
      });

      logger.info(
        `🔎 Checked ${reservations.length} reservations. Found ${totalErrors} violations in ${reservationsWithErrors} reservations.`,
      );
    });
  } catch (err) {
    logger.error("❌ Error while checking consistency", err);
  }
}
