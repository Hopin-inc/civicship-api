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

@injectable()
export default class ReservationValidator {
  private static readonly RESERVATION_THRESHOLD_DAYS = 1;

  validateReservable(
    slot: PrismaOpportunitySlotReserve,
    participantCount: number,
    remainingCapacity: number | undefined,
  ) {
    this.validateSlotScheduledAndNotStarted(slot);
    this.validateSlotAdvanceBookingThreshold(slot.startsAt);

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

  validateCancellable(slotStartAt: Date) {
    const now = new Date();
    const cancelLimit = new Date(slotStartAt);
    cancelLimit.setDate(cancelLimit.getDate() - 1);

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

  private validateSlotAdvanceBookingThreshold(startsAt: Date) {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + ReservationValidator.RESERVATION_THRESHOLD_DAYS);
    if (startsAt.getTime() < thresholdDate.getTime()) {
      throw new ReservationAdvanceBookingRequiredError();
    }
  }
}
