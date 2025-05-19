import "reflect-metadata";
import { ValidationError } from "@/errors/graphql";
import { OpportunitySlotHostingStatus, ReservationStatus } from "@prisma/client";
import ReservationValidator from "@/application/domain/experience/reservation/validator";

describe("ReservationValidator", () => {
  const validator = new ReservationValidator();

  describe("validateReservable", () => {
    it("should pass when slot is valid and no conflicts and enough capacity", () => {
      const slot = {
        hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
        startsAt: futureDate(),
      } as any;
      const participantCount = 2;
      const remainingCapacity = 5;

      expect(() => {
        validator.validateReservable(slot, participantCount, remainingCapacity);
      }).not.toThrow();
    });

    it("should throw if slot is not scheduled", () => {
      const slot = {
        hostingStatus: OpportunitySlotHostingStatus.CANCELLED,
        startsAt: futureDate(),
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).toThrow(ValidationError);
    });

    it("should throw if slot has already started", () => {
      const slot = {
        hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
        startsAt: pastDate(),
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).toThrow(ValidationError);
    });

    it("should throw if there are conflicting reservations", () => {
      const slot = {
        hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
        startsAt: futureDate(),
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).toThrow(ValidationError);
    });

    it("should throw if participant count exceeds capacity", () => {
      const slot = {
        hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
        startsAt: futureDate(),
      } as any;

      expect(() => {
        validator.validateReservable(slot, 10, 5);
      }).toThrow(ValidationError);
    });
  });

  describe("validateJoinable", () => {
    it("should pass and return availableParticipationId if joinable", () => {
      const reservation = {
        status: ReservationStatus.ACCEPTED,
        opportunitySlot: {
          hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
          startsAt: futureDate(),
        },
        participations: [
          { id: "p1", userId: null },
          { id: "p2", userId: "user-2" },
        ],
      } as any;

      const result = validator.validateJoinable(reservation, "user-1");

      expect(result).toEqual({ availableParticipationId: "p1" });
    });

    it("should throw if reservation is not accepted", () => {
      const reservation = {
        status: ReservationStatus.APPLIED,
        opportunitySlot: {
          hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
          startsAt: futureDate(),
        },
        participations: [],
      } as any;

      expect(() => {
        validator.validateJoinable(reservation, "user-1");
      }).toThrow(ValidationError);
    });

    it("should throw if opportunitySlot has already started", () => {
      const reservation = {
        status: ReservationStatus.ACCEPTED,
        opportunitySlot: {
          hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
          startsAt: pastDate(),
        },
        participations: [],
      } as any;

      expect(() => {
        validator.validateJoinable(reservation, "user-1");
      }).toThrow(ValidationError);
    });

    it("should throw if user already joined", () => {
      const reservation = {
        status: ReservationStatus.ACCEPTED,
        opportunitySlot: {
          hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
          startsAt: futureDate(),
        },
        participations: [{ id: "p1", userId: "user-1" }],
      } as any;

      expect(() => {
        validator.validateJoinable(reservation, "user-1");
      }).toThrow(ValidationError);
    });

    it("should throw if no available participations", () => {
      const reservation = {
        status: ReservationStatus.ACCEPTED,
        opportunitySlot: {
          hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
          startsAt: futureDate(),
        },
        participations: [{ id: "p1", userId: "user-2" }],
      } as any;

      expect(() => {
        validator.validateJoinable(reservation, "user-1");
      }).toThrow(ValidationError);
    });
  });

  describe("validateCancellable", () => {
    it("should pass if cancellation is before 24 hours", () => {
      const slotStartAt = futureDate(2); // 2日後
      expect(() => {
        validator.validateCancellable(slotStartAt);
      }).not.toThrow();
    });

    it("should throw if cancellation is within 24 hours", () => {
      const slotStartAt = futureDate(0.5); // 半日後
      expect(() => {
        validator.validateCancellable(slotStartAt);
      }).toThrow(ValidationError);
    });
  });
});

// 🔹 テスト用ヘルパー関数
function futureDate(days = 1): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function pastDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}
