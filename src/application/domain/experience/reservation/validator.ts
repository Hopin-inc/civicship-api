import { 
  ReservationFullError, 
  AlreadyJoinedError, 
  ReservationConflictError, 
  AlreadyStartedReservationError,
  ReservationCancellationTimeoutError,
  ReservationAdvanceBookingRequiredError,
  ReservationNotAcceptedError,
  SlotNotScheduledError,
  NoAvailableParticipationSlotsError
} from "@/errors/graphql";
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";

enum OpportunitySlotHostingStatus {
  SCHEDULED = "SCHEDULED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

enum ReservationStatus {
  APPLIED = "APPLIED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}
import { injectable } from "tsyringe";
import { PrismaOpportunitySlotReserve } from "@/application/domain/experience/opportunitySlot/data/type";

@injectable()
export default class ReservationValidator {
  validateReservable(
    slot: PrismaOpportunitySlotReserve,
    participantCount: number,
    remainingCapacity: number | undefined,
    reservations: PrismaReservation[],
  ) {
    this.validateSlotScheduledAndNotStarted(slot);
    this.validateNoConflicts(reservations.length);
    this.validateSlotAtLeast7DaysAhead(slot.startsAt);

    if (remainingCapacity !== undefined && participantCount > remainingCapacity) {
      throw new ReservationFullError(
        remainingCapacity,
        participantCount
      );
    }
  }

  validateJoinable(
    reservation: Pick<PrismaReservation, "status" | "participations" | "opportunitySlot">,
    userId: string,
  ): { availableParticipationId: string } {
    if (reservation.status !== ReservationStatus.ACCEPTED) {
      throw new ReservationNotAcceptedError();
    }
    this.validateSlotScheduledAndNotStarted(reservation.opportunitySlot);

    const isAlreadyJoined = reservation.participations.some((p) => p.userId === userId);
    if (isAlreadyJoined) {
      throw new AlreadyJoinedError();
    }

    const target = reservation.participations.find((p) => p.userId === null);
    if (!target) {
      throw new NoAvailableParticipationSlotsError();
    }

    return { availableParticipationId: target.id };
  }

  validateCancellable(slotStartAt: Date) {
    const now = new Date();
    const cancelLimit = new Date(slotStartAt);
    cancelLimit.setHours(cancelLimit.getHours() - 24);

    if (now > cancelLimit) {
      throw new ReservationCancellationTimeoutError();
    }
  }

  private validateNoConflicts(length: number) {
    if (length > 0) {
      throw new ReservationConflictError();
    }
  }

  private validateSlotScheduledAndNotStarted(
    slot: Pick<PrismaOpportunitySlotReserve, "hostingStatus" | "startsAt">,
  ) {
    if (slot.hostingStatus !== OpportunitySlotHostingStatus.SCHEDULED) {
      throw new SlotNotScheduledError();
    }
    if (slot.startsAt.getTime() < Date.now()) {
      throw new AlreadyStartedReservationError();
    }
  }

  private validateSlotAtLeast7DaysAhead(startsAt: Date) {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (startsAt.getTime() < sevenDaysLater.getTime()) {
      throw new ReservationAdvanceBookingRequiredError();
    }
  }
}
