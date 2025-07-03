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

    // Create a deadline date which is the day before the event at 23:59 JST
    const cancelLimit = new Date(slotStartAt);
    cancelLimit.setDate(cancelLimit.getDate() - 1); // Set to the day before
    cancelLimit.setHours(23, 59, 59, 999); // Set to 23:59:59.999 JST

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

    // Get the date of the event
    const eventDate = new Date(startsAt);

    // Create a deadline date which is the day before the event at 23:59 JST
    const deadlineDate = new Date(eventDate);
    deadlineDate.setDate(deadlineDate.getDate() - 1); // Set to the day before
    deadlineDate.setHours(23, 59, 59, 999); // Set to 23:59:59.999 JST

    // Check if current time is past the deadline
    if (now > deadlineDate) {
      throw new ReservationAdvanceBookingRequiredError();
    }
  }
}
