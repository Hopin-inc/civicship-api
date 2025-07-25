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
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";
import { injectable } from "tsyringe";
import { PrismaOpportunitySlotReserve } from "@/application/domain/experience/opportunitySlot/data/type";
import {
  GqlOpportunitySlotHostingStatus as OpportunitySlotHostingStatus,
  GqlReservationStatus as ReservationStatus,
} from "@/types/graphql";
import { getAdvanceBookingDays } from "@/application/domain/experience/reservation/config";

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
    const advanceBookingDays = getAdvanceBookingDays(opportunityId);

    // If advanceBookingDays is 0, cancellation is allowed until the start time
    if (advanceBookingDays === 0) {
      if (now.getTime() >= slotStartAt.getTime()) {
        throw new ReservationCancellationTimeoutError();
      }
      return;
    }

    // Otherwise, use the configured advance booking days
    const cancelLimit = new Date(slotStartAt);
    cancelLimit.setDate(cancelLimit.getDate() - advanceBookingDays);

    if (now > cancelLimit) {
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
      if (now.getTime() >= startsAt.getTime()) {
        throw new ReservationAdvanceBookingRequiredError();
      }
      return;
    }

    // Otherwise, use the configured advance booking days
    const thresholdDate = new Date(now.getTime() + (advanceBookingDays * 24 * 60 * 60 * 1000));
    if (startsAt.getTime() < thresholdDate.getTime()) {
      throw new ReservationAdvanceBookingRequiredError();
    }
  }
}
