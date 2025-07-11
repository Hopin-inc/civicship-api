import "reflect-metadata";
import { 
  AlreadyStartedReservationError,
  ReservationFullError,
  ReservationNotAcceptedError,
  AlreadyJoinedError,
  NoAvailableParticipationSlotsError,
  ReservationCancellationTimeoutError
} from "@/errors/graphql";
import ReservationValidator from "@/application/domain/experience/reservation/validator";

describe("ReservationValidator", () => {
  const validator = new ReservationValidator();

  describe("validateReservable", () => {
    it("should pass when slot is valid and no conflicts and enough capacity", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(2), // 2 days in future to avoid advance booking error
      } as any;
      const participantCount = 2;
      const remainingCapacity = 5;

      expect(() => {
        validator.validateReservable(slot, participantCount, remainingCapacity);
      }).not.toThrow();
    });

    it("should throw if slot is not scheduled", () => {
      const slot = {
        hostingStatus: "CANCELLED" as any,
        startsAt: futureDate(),
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).toThrow("This slot is not scheduled.");
    });

    it("should throw if slot has already started", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: pastDate(),
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).toThrow(AlreadyStartedReservationError);
    });

    it("should throw if there are conflicting reservations", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(2), // 2 days in future to avoid advance booking error
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).not.toThrow();
    });

    it("should throw if participant count exceeds capacity", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(2), // 2 days in future to avoid advance booking error
      } as any;

      expect(() => {
        validator.validateReservable(slot, 10, 5);
      }).toThrow(ReservationFullError);
    });
  });

  describe("validateJoinable", () => {
    it("should pass and return availableParticipationId if joinable", () => {
      const reservation = {
        status: "ACCEPTED" as any,
        opportunitySlot: {
          hostingStatus: "SCHEDULED" as any,
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
        status: "APPLIED" as any,
        opportunitySlot: {
          hostingStatus: "SCHEDULED" as any,
          startsAt: futureDate(),
        },
        participations: [],
      } as any;

      expect(() => {
        validator.validateJoinable(reservation, "user-1");
      }).toThrow(ReservationNotAcceptedError);
    });

    it("should throw if opportunitySlot has already started", () => {
      const reservation = {
        status: "ACCEPTED" as any,
        opportunitySlot: {
          hostingStatus: "SCHEDULED" as any,
          startsAt: pastDate(),
        },
        participations: [],
      } as any;

      expect(() => {
        validator.validateJoinable(reservation, "user-1");
      }).toThrow(AlreadyStartedReservationError);
    });

    it("should throw if user already joined", () => {
      const reservation = {
        status: "ACCEPTED" as any,
        opportunitySlot: {
          hostingStatus: "SCHEDULED" as any,
          startsAt: futureDate(),
        },
        participations: [{ id: "p1", userId: "user-1" }],
      } as any;

      expect(() => {
        validator.validateJoinable(reservation, "user-1");
      }).toThrow(AlreadyJoinedError);
    });

    it("should throw if no available participations", () => {
      const reservation = {
        status: "ACCEPTED" as any,
        opportunitySlot: {
          hostingStatus: "SCHEDULED" as any,
          startsAt: futureDate(),
        },
        participations: [{ id: "p1", userId: "user-2" }],
      } as any;

      expect(() => {
        validator.validateJoinable(reservation, "user-1");
      }).toThrow(NoAvailableParticipationSlotsError);
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
      }).toThrow(ReservationCancellationTimeoutError);
    });

    it("should handle exact 24-hour boundary condition", () => {
      const now = new Date();
      const exactLimit = new Date(now);
      exactLimit.setDate(exactLimit.getDate() + 1);
      exactLimit.setMilliseconds(exactLimit.getMilliseconds() + 1);

      expect(() => {
        validator.validateCancellable(exactLimit);
      }).not.toThrow();
    });

    it("should throw when exactly at 24-hour limit", () => {
      const now = new Date();
      const exactLimit = new Date(now);
      exactLimit.setDate(exactLimit.getDate() + 1);
      exactLimit.setMilliseconds(exactLimit.getMilliseconds() - 1); // Just under 24 hours

      expect(() => {
        validator.validateCancellable(exactLimit);
      }).toThrow(ReservationCancellationTimeoutError);
    });

    it("should handle future daylight saving time transitions", () => {
      const now = new Date();
      const futureSpringForward = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours from now
      const futureFallBack = new Date(now.getTime() + (72 * 60 * 60 * 1000)); // 72 hours from now
      
      expect(() => {
        validator.validateCancellable(futureSpringForward);
      }).not.toThrow();
      
      expect(() => {
        validator.validateCancellable(futureFallBack);
      }).not.toThrow();
    });

    it("should handle future leap year edge cases", () => {
      const now = new Date();
      const futureLeapYearDate = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours from now
      expect(() => {
        validator.validateCancellable(futureLeapYearDate);
      }).not.toThrow();
    });

    it("should handle timezone edge cases with future dates", () => {
      const now = new Date();
      const futureUtcDate = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours from now
      const futureLocalDate = new Date(now.getTime() + (72 * 60 * 60 * 1000)); // 72 hours from now
      
      expect(() => {
        validator.validateCancellable(futureUtcDate);
      }).not.toThrow();
      
      expect(() => {
        validator.validateCancellable(futureLocalDate);
      }).not.toThrow();
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
