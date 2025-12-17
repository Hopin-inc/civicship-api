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
  evaluation: { id: string } | null;
};

/**
 * Determines if a participation can be auto-fixed and returns the expected status/reason.
 * Returns null if the participation cannot be auto-fixed.
 *
 * Auto-fixable patterns (observed in production):
 * 1. CANCELED/REJECTED reservation + PARTICIPATING status + RESERVATION_ACCEPTED reason
 * 2. OPPORTUNITY_CANCELED reason + PARTICIPATING status
 *
 * All patterns require: no evaluation exists
 */
function getAutoFixDetails(
  reservation: Reservation,
  participation: Participation,
): { status: ParticipationStatus; reason: ParticipationStatusReason } | null {
  // Skip if has evaluation (never auto-fix)
  if (participation.evaluation) {
    return null;
  }

  // Pattern 1: CANCELED/REJECTED reservation with PARTICIPATING status and RESERVATION_ACCEPTED reason
  if (
    (reservation.status === ReservationStatus.CANCELED || reservation.status === ReservationStatus.REJECTED) &&
    participation.status === ParticipationStatus.PARTICIPATING &&
    participation.reason === ParticipationStatusReason.RESERVATION_ACCEPTED
  ) {
    return {
      status: ParticipationStatus.NOT_PARTICIPATING,
      reason:
        reservation.status === ReservationStatus.CANCELED
          ? ParticipationStatusReason.RESERVATION_CANCELED
          : ParticipationStatusReason.RESERVATION_REJECTED,
    };
  }

  // Pattern 2: OPPORTUNITY_CANCELED reason with PARTICIPATING status
  if (
    participation.reason === ParticipationStatusReason.OPPORTUNITY_CANCELED &&
    participation.status === ParticipationStatus.PARTICIPATING
  ) {
    return {
      status: ParticipationStatus.NOT_PARTICIPATING,
      reason: ParticipationStatusReason.OPPORTUNITY_CANCELED,
    };
  }

  return null;
}

/**
 * Validates the consistency between reservation and participation states.
 * Returns an array of validation error messages (empty if valid).
 *
 * Validation rules:
 * 1. OPPORTUNITY_CANCELED must always have NOT_PARTICIPATING status
 * 2. PERSONAL_RECORD participations are not tied to reservations (handled separately)
 * 3. Evaluation invariants: evaluationId exists only for ACCEPTED reservations with PARTICIPATED status
 * 4. Each reservation status has specific allowed participation status and reason combinations
 */
function validateConsistency(
  reservation: Reservation,
  participation: Participation,
): string[] {
  const errors: string[] = [];
  const hasEvaluation = !!participation.evaluation;

  // Rule 1: OPPORTUNITY_CANCELED must always have NOT_PARTICIPATING status
  if (participation.reason === ParticipationStatusReason.OPPORTUNITY_CANCELED) {
    if (participation.status !== ParticipationStatus.NOT_PARTICIPATING) {
      errors.push(
        `OPPORTUNITY_CANCELED requires NOT_PARTICIPATING status, got ${participation.status}`,
      );
    }
    return errors; // Skip other validations for canceled opportunities
  }

  // Rule 2: PERSONAL_RECORD participations should not be validated against reservations
  if (participation.reason === ParticipationStatusReason.PERSONAL_RECORD) {
    return errors; // No validation needed for personal records in this context
  }

  if (hasEvaluation) {
    if (reservation.status !== ReservationStatus.ACCEPTED) {
      errors.push(
        `Evaluation exists but reservation status is ${reservation.status} (expected ACCEPTED)`,
      );
    }
    // Evaluated participations must be PARTICIPATED
    if (participation.status !== ParticipationStatus.PARTICIPATED) {
      errors.push(
        `Evaluation exists but participation status is ${participation.status} (expected PARTICIPATED)`,
      );
    }
  }

  // Rule 4: Validate states based on reservation status
  switch (reservation.status) {
    case ReservationStatus.ACCEPTED: {
      if (participation.reason === ParticipationStatusReason.RESERVATION_ACCEPTED) {
        if (
          !hasEvaluation &&
          participation.status !== ParticipationStatus.PARTICIPATING &&
          participation.status !== ParticipationStatus.NOT_PARTICIPATING
        ) {
          errors.push(
            `ACCEPTED reservation without evaluation expects PARTICIPATING or NOT_PARTICIPATING, got ${participation.status}`,
          );
        }
      } else {
        errors.push(
          `ACCEPTED reservation expects RESERVATION_ACCEPTED reason, got ${participation.reason}`,
        );
      }
      break;
    }

    case ReservationStatus.APPLIED: {
      if (participation.reason === ParticipationStatusReason.RESERVATION_APPLIED) {
        if (
          participation.status !== ParticipationStatus.PENDING &&
          participation.status !== ParticipationStatus.NOT_PARTICIPATING
        ) {
          errors.push(
            `APPLIED reservation expects PENDING or NOT_PARTICIPATING, got ${participation.status}`,
          );
        }
      } else {
        errors.push(
          `APPLIED reservation expects RESERVATION_APPLIED reason, got ${participation.reason}`,
        );
      }
      break;
    }

    case ReservationStatus.REJECTED:
    case ReservationStatus.CANCELED: {
      const expectedReason =
        reservation.status === ReservationStatus.REJECTED
          ? ParticipationStatusReason.RESERVATION_REJECTED
          : ParticipationStatusReason.RESERVATION_CANCELED;

      if (participation.reason !== expectedReason) {
        errors.push(
          `${reservation.status} reservation expects ${expectedReason} reason, got ${participation.reason}`,
        );
      }

      if (participation.status !== ParticipationStatus.NOT_PARTICIPATING) {
        errors.push(
          `${reservation.status} reservation must have NOT_PARTICIPATING status, got ${participation.status}`,
        );
      }
      break;
    }
  }

  return errors;
}

export async function checkReservationParticipationConsistency() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

  logger.debug("🔍 Checking reservation-participation consistency...");

  try {
    await issuer.internal(async (tx) => {
      const reservations = await tx.reservation.findMany({
        where: {
          status: {
            in: [
              ReservationStatus.APPLIED,
              ReservationStatus.ACCEPTED,
              ReservationStatus.REJECTED,
              ReservationStatus.CANCELED,
            ],
          },
        },
        include: {
          participations: {
            include: {
              evaluation: {
                select: { id: true },
              },
            },
          },
        },
      });

      let totalErrors = 0;
      let reservationsWithErrors = 0;
      let autoFixedCount = 0;

      for (const r of reservations) {
        if (!r.participations || r.participations.length === 0) {
          // ACCEPTED reservations should always have participations - treat as error
          if (r.status === ReservationStatus.ACCEPTED) {
            totalErrors++;
            reservationsWithErrors++;
            logger.error("❌ ACCEPTED reservation has no participations", {
              reservationId: r.id,
              reservationStatus: r.status,
            });
          } else {
            logger.warn("⚠️ Reservation has no participations", {
              reservationId: r.id,
              reservationStatus: r.status,
            });
          }
          continue;
        }

        let hasUnfixableErrors = false;

        for (const p of r.participations) {
          const validationErrors = validateConsistency(r, p);

          if (validationErrors.length > 0) {
            const fixDetails = getAutoFixDetails(r, p);

            if (fixDetails) {
              // Auto-fixable pattern detected
              logger.debug("🔧 Auto-fixing inconsistent participation", {
                reservationId: r.id,
                reservationStatus: r.status,
                participationId: p.id,
                from: {
                  status: p.status,
                  reason: p.reason,
                },
                to: {
                  status: fixDetails.status,
                  reason: fixDetails.reason,
                },
              });

              await tx.participation.update({
                where: { id: p.id },
                data: {
                  status: fixDetails.status,
                  reason: fixDetails.reason,
                },
              });

              autoFixedCount++;
              logger.debug("✅ Fixed participation", {
                participationId: p.id,
                newStatus: fixDetails.status,
                newReason: fixDetails.reason,
              });
            } else {
              // Cannot auto-fix, log as error
              hasUnfixableErrors = true;
              totalErrors += validationErrors.length;

              logger.error("❌ Inconsistent reservation-participation pair (cannot auto-fix)", {
                reservationId: r.id,
                reservationStatus: r.status,
                participationId: p.id,
                participationStatus: p.status,
                participationReason: p.reason,
                hasEvaluation: !!p.evaluation,
                evaluationId: p.evaluation?.id ?? null,
                violations: validationErrors,
              });
            }
          }
        }

        if (hasUnfixableErrors) {
          reservationsWithErrors++;
        }
      }

      logger.debug(
        `🔎 Checked ${reservations.length} reservations. Auto-fixed ${autoFixedCount} participations. Found ${totalErrors} unfixable violations in ${reservationsWithErrors} reservations.`,
      );
    });
  } catch (err) {
    logger.error("❌ Error while checking consistency", err);
  }
}

