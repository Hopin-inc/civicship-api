import { OpportunitySlotHostingStatus, ReservationStatus } from "@prisma/client";
import ReservationValidator from "@/application/domain/experience/reservation/validator";

const futureDate = () => new Date(Date.now() + 10000 * 60 * 60); // +1h
const pastDate = () => new Date(Date.now() - 10000 * 60 * 60); // -1h

describe("ReservationValidator", () => {
  describe("validateReservable", () => {
    const slot = {
      hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
      startsAt: futureDate(),
    } as any;

    it("passes if remainingCapacity is undefined (no limit)", () => {
      expect(() => ReservationValidator.validateReservable(slot, 999, undefined, [])).not.toThrow();
    });

    it("throws if slot is null (defensive check)", () => {
      expect(() => ReservationValidator.validateReservable(null as any, 2, 5, [])).toThrow();
    });

    it("passes when slot is valid and capacity is enough", () => {
      expect(() => ReservationValidator.validateReservable(slot, 2, 5, [])).not.toThrow();
    });

    it("throws if slot is not scheduled", () => {
      expect(() =>
        ReservationValidator.validateReservable(
          { ...slot, hostingStatus: OpportunitySlotHostingStatus.CANCELLED },
          1,
          10,
          [],
        ),
      ).toThrow("This slot is not scheduled.");
    });

    it("throws if slot already started", () => {
      expect(() =>
        ReservationValidator.validateReservable({ ...slot, startsAt: pastDate() }, 1, 10, []),
      ).toThrow("This slot has already started.");
    });

    it("throws if reservation conflicts exist", () => {
      expect(() => ReservationValidator.validateReservable(slot, 1, 10, [{} as any])).toThrow(
        "You already have a conflicting reservation.",
      );
    });

    it("throws if capacity is exceeded", () => {
      expect(() => ReservationValidator.validateReservable(slot, 6, 5, [])).toThrow(
        "Capacity exceeded for this opportunity slot.",
      );
    });
  });

  describe("validateJoinable", () => {
    const reservationBase = {
      status: ReservationStatus.ACCEPTED,
      opportunitySlot: {
        hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
        startsAt: futureDate(),
      },
    } as any;

    it("returns participationId if valid", () => {
      const result = ReservationValidator.validateJoinable(
        {
          ...reservationBase,
          participations: [
            { id: "p1", userId: null },
            { id: "p2", userId: "someone-else" },
          ],
        },
        "user-123",
      );
      expect(result).toEqual({ availableParticipationId: "p1" });
    });

    it("throws if reservation is not accepted", () => {
      expect(() =>
        ReservationValidator.validateJoinable(
          { ...reservationBase, status: ReservationStatus.APPLIED, participations: [] },
          "user-123",
        ),
      ).toThrow("Reservation is not accepted yet.");
    });

    it("throws if user has already joined", () => {
      expect(() =>
        ReservationValidator.validateJoinable(
          {
            ...reservationBase,
            participations: [{ id: "p1", userId: "user-123" }],
          },
          "user-123",
        ),
      ).toThrow("You have already joined this reservation.");
    });

    it("throws if no available participations", () => {
      expect(() =>
        ReservationValidator.validateJoinable(
          {
            ...reservationBase,
            participations: [{ id: "p1", userId: "someone-else" }],
          },
          "user-123",
        ),
      ).toThrow("No available participation slots.");
    });

    it("throws if opportunitySlot already started", () => {
      expect(() =>
        ReservationValidator.validateJoinable(
          {
            ...reservationBase,
            opportunitySlot: { hostingStatus: "SCHEDULED", startsAt: pastDate() },
            participations: [{ id: "p1", userId: null }],
          },
          "user-123",
        ),
      ).toThrow("This slot has already started.");
    });
  });

  describe("validateCancellable", () => {
    it("passes if before 24h", () => {
      const future = new Date(Date.now() + 1000 * 60 * 60 * 25); // +25h
      expect(() => ReservationValidator.validateCancellable(future)).not.toThrow();
    });

    it("throws if within 24h", () => {
      const near = new Date(Date.now() + 1000 * 60 * 60 * 23); // +23h
      expect(() => ReservationValidator.validateCancellable(near)).toThrow(
        "Reservation can no longer be canceled within 24 hours of the event.",
      );
    });
  });
});
