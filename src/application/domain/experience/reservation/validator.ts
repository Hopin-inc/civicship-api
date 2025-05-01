import { ValidationError } from "@/errors/graphql";
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";
import { OpportunitySlotHostingStatus, ReservationStatus } from "@prisma/client";
import { PrismaOpportunitySlot } from "@/application/domain/experience/opportunitySlot/data/type";
import { injectable } from "tsyringe";

@injectable()
export default class ReservationValidator {
  validateReservable(
    slot: PrismaOpportunitySlot,
    participantCount: number,
    remainingCapacity: number | undefined,
    reservations: PrismaReservation[],
  ) {
    this.validateSlotScheduledAndNotStarted(slot);
    this.validateNoConflicts(reservations);

    if (remainingCapacity !== undefined && participantCount > remainingCapacity) {
      throw new ValidationError("Capacity exceeded for this opportunity slot.", [
        `remainingCapacity: ${remainingCapacity}`,
        `requested: ${participantCount}`,
      ]);
    }
  }

  validateJoinable(
    reservation: PrismaReservation,
    userId: string,
  ): { availableParticipationId: string } {
    if (reservation.status !== ReservationStatus.ACCEPTED) {
      throw new ValidationError("Reservation is not accepted yet.");
    }
    this.validateSlotScheduledAndNotStarted(reservation.opportunitySlot);

    const isAlreadyJoined = reservation.participations.some((p) => p.userId === userId);
    if (isAlreadyJoined) {
      throw new ValidationError("You have already joined this reservation.");
    }

    const target = reservation.participations.find((p) => p.userId === null);
    if (!target) {
      throw new ValidationError("No available participation slots.");
    }

    return { availableParticipationId: target.id };
  }

  validateCancellable(slotStartAt: Date) {
    const now = new Date();
    const cancelLimit = new Date(slotStartAt);
    cancelLimit.setHours(cancelLimit.getHours() - 24);

    if (now > cancelLimit) {
      throw new ValidationError(
        "Reservation can no longer be canceled within 24 hours of the event.",
      );
    }
  }

  private validateNoConflicts(conflicts: PrismaReservation[]) {
    if (conflicts.length > 0) {
      throw new ValidationError("You already have a conflicting reservation.");
    }
  }

  private validateSlotScheduledAndNotStarted(slot: PrismaOpportunitySlot) {
    if (slot.hostingStatus !== OpportunitySlotHostingStatus.SCHEDULED) {
      throw new ValidationError("This slot is not scheduled.");
    }
    if (slot.startsAt.getTime() < Date.now()) {
      throw new ValidationError("This slot has already started.");
    }
  }
}
