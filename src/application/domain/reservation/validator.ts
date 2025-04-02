import { ValidationError } from "@/errors/graphql";
import { PrismaReservation } from "@/application/domain/reservation/data/type";
import { OpportunitySlotHostingStatus, ReservationStatus } from "@prisma/client";
import { PrismaOpportunitySlot } from "@/application/domain/opportunitySlot/data/type";

export default class ReservationValidator {
  static validateReservable(
    slot: PrismaOpportunitySlot,
    participantCount: number,
    currentParticipantCount: number,
    reservations: PrismaReservation[],
  ) {
    this.validateSlotScheduledAndNotStarted(slot);
    this.validateNoConflicts(reservations);

    if (slot.capacity !== null) {
      const remainingCapacity = slot.capacity - currentParticipantCount;
      if (participantCount > remainingCapacity) {
        throw new ValidationError("Capacity exceeded for this opportunity slot.", [
          `remainingCapacity: ${remainingCapacity}`,
          `requested: ${participantCount}`,
        ]);
      }
    }
  }

  static validateJoinable(
    reservation: PrismaReservation,
    userId: string,
  ): { availableParticipationId: string } {
    if (reservation.status !== ReservationStatus.ACCEPTED) {
      throw new ValidationError("Reservation is not accepted yet.");
    }

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

  static validateCancellable(slotStartAt: Date) {
    const now = new Date();
    const cancelLimit = new Date(slotStartAt);
    cancelLimit.setHours(cancelLimit.getHours() - 24);

    if (now > cancelLimit) {
      throw new ValidationError(
        "Reservation can no longer be canceled within 24 hours of the event.",
      );
    }
  }

  private static validateNoConflicts(conflicts: PrismaReservation[]) {
    if (conflicts.length > 0) {
      throw new ValidationError("You already have a conflicting reservation.");
    }
  }

  private static validateSlotScheduledAndNotStarted(slot: PrismaOpportunitySlot) {
    if (slot.hostingStatus !== OpportunitySlotHostingStatus.SCHEDULED) {
      throw new ValidationError("This slot is not scheduled.");
    }
    if (slot.startsAt.getTime() < Date.now()) {
      throw new ValidationError("This slot has already started.");
    }
  }
}
