import { ValidationError } from "@/errors/graphql";
import { PrismaReservation } from "@/application/reservation/data/type";

export default class ReservationValidator {
  static validateCapacity(
    capacity: number | null,
    participantCount: number,
    currentParticipantCount: number,
  ) {
    if (!capacity) return;

    const remainingCapacity = capacity - currentParticipantCount;

    if (participantCount > remainingCapacity) {
      throw new ValidationError("Capacity exceeded for this opportunity slot.", [
        `remainingCapacity: ${remainingCapacity}`,
        `requested: ${participantCount}`,
      ]);
    }
  }

  static validateJoinable(
    reservation: PrismaReservation,
    userId: string,
  ): { availableParticipationId: string } {
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
}
