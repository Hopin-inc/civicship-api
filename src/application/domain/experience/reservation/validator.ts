import {
  ReservationFullError,
  AlreadyJoinedError,
  AlreadyStartedReservationError,
  ReservationCancellationTimeoutError,
  ReservationAdvanceBookingRequiredError,
  ReservationNotAcceptedError,
  SlotNotScheduledError,
  NoAvailableParticipationSlotsError,
} from "@/errors/graphql";
import { endOfDay, subDays, isAfter } from "date-fns";
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";
import { injectable } from "tsyringe";
import { PrismaOpportunitySlotReserve } from "@/application/domain/experience/opportunitySlot/data/type";
import {
  GqlOpportunitySlotHostingStatus as OpportunitySlotHostingStatus,
  GqlReservationStatus as ReservationStatus,
} from "@/types/graphql";
import { getAdvanceBookingDays, DEFAULT_CANCELLATION_DEADLINE_DAYS } from "@/application/domain/experience/reservation/config";

@injectable()
export default class ReservationValidator {

  validateReservable(
    slot: PrismaOpportunitySlotReserve,
    participantCount: number,
    remainingCapacity: number | undefined,
  ) {
    this.validateSlotScheduledAndNotStarted(slot);
    this.validateSlotAdvanceBookingThreshold(slot.startsAt, slot.opportunityId);

    if (remainingCapacity !== undefined && participantCount > remainingCapacity) {
      throw new ReservationFullError(remainingCapacity, participantCount);
    }
  }

  validateJoinable(
    reservation: Pick<PrismaReservation, "status" | "participations" | "opportunitySlot">,
    userId: string,
  ): { availableParticipationId: string } {
    if (reservation.status !== ReservationStatus.Accepted) {
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

  validateCancellable(slotStartAt: Date, opportunityId?: string) {
    const now = new Date();
    
    // Use DEFAULT_CANCELLATION_DEADLINE_DAYS (1 day) for all activities
    // This allows cancellations until 23:59 of the day before the activity
    const cancelLimit = endOfDay(subDays(slotStartAt, DEFAULT_CANCELLATION_DEADLINE_DAYS));

    if (isAfter(now, cancelLimit)) {
      throw new ReservationCancellationTimeoutError();
    }
  }

  private validateSlotScheduledAndNotStarted(
    slot: Pick<PrismaOpportunitySlotReserve, "hostingStatus" | "startsAt">,
  ) {
    if (slot.hostingStatus !== OpportunitySlotHostingStatus.Scheduled) {
      throw new SlotNotScheduledError();
    }
    if (slot.startsAt.getTime() < Date.now()) {
      throw new AlreadyStartedReservationError();
    }
  }

  private validateSlotAdvanceBookingThreshold(startsAt: Date, opportunityId?: string) {
    const now = new Date();
    const advanceBookingDays = getAdvanceBookingDays(opportunityId);

    // If advanceBookingDays is 0, booking is allowed until the start time
    if (advanceBookingDays === 0) {
      if (isAfter(now, startsAt)) {
        throw new ReservationAdvanceBookingRequiredError();
      }
      return;
    }

    // Calculate the deadline as end of day N days before the event start date
    const deadlineDate = endOfDay(subDays(startsAt, advanceBookingDays));

    if (isAfter(now, deadlineDate)) {
      throw new ReservationAdvanceBookingRequiredError();
    }
  }
}
