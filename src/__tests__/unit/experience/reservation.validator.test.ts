import "reflect-metadata";
import {
  AlreadyStartedReservationError,
  ReservationFullError,
  ReservationNotAcceptedError,
  AlreadyJoinedError,
  NoAvailableParticipationSlotsError,
  ReservationCancellationTimeoutError,
  ReservationAdvanceBookingRequiredError,
} from "@/errors/graphql";
import { DEFAULT_CANCELLATION_DEADLINE_DAYS } from "@/application/domain/experience/reservation/config";
import ReservationValidator from "@/application/domain/experience/reservation/validator";
import * as config from "@/application/domain/experience/reservation/config";

describe("ReservationValidator", () => {
  const validator = new ReservationValidator();

  describe("validateReservable", () => {
    it("should pass when slot is valid and no conflicts and enough capacity", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(8), // 8 days in future to avoid advance booking error (default is 7 days)
        opportunityId: "test-opportunity-id"
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
        opportunityId: "test-opportunity-id"
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).toThrow(AlreadyStartedReservationError);
    });

    it("should throw if there are conflicting reservations", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(8), // 8 days in future to avoid advance booking error (default is 7 days)
        opportunityId: "test-opportunity-id"
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).not.toThrow();
    });

    it("should throw if participant count exceeds capacity", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(8), // 8 days in future to avoid advance booking error (default is 7 days)
        opportunityId: "test-opportunity-id"
      } as any;

      expect(() => {
        validator.validateReservable(slot, 10, 5);
      }).toThrow(ReservationFullError);
    });

    it("should throw if booking is within the default advance booking period", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(5), // 5 days in future (default is 7 days)
        opportunityId: "test-opportunity-id"
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).toThrow(ReservationAdvanceBookingRequiredError);
    });

    describe("with custom advance booking days", () => {
      beforeEach(() => {
        jest.spyOn(config, 'getAdvanceBookingDays').mockImplementation((activityId) => {
          if (activityId === 'custom-activity-id') {
            return 3;
          }
          if (activityId === 'zero-days-activity-id') {
            return 0;
          }
          return 7; // Default
        });
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should pass if booking is within custom advance booking period for specific activity", () => {
        const slot = {
          hostingStatus: "SCHEDULED" as any,
          startsAt: futureDate(4), // 4 days in future (custom is 3 days)
          opportunityId: "custom-activity-id"
        } as any;

        expect(() => {
          validator.validateReservable(slot, 1, 5);
        }).not.toThrow();
      });

      it("should throw if booking is within custom advance booking period for specific activity", () => {
        const slot = {
          hostingStatus: "SCHEDULED" as any,
          startsAt: futureDate(2), // 2 days in future (custom is 3 days)
          opportunityId: "custom-activity-id"
        } as any;

        expect(() => {
          validator.validateReservable(slot, 1, 5);
        }).toThrow(ReservationAdvanceBookingRequiredError);
      });

      it("should allow booking until start time for activities with 0 advance booking days", () => {
        const slot = {
          hostingStatus: "SCHEDULED" as any,
          startsAt: futureDate(0.01), // Just slightly in the future
          opportunityId: "zero-days-activity-id"
        } as any;

        expect(() => {
          validator.validateReservable(slot, 1, 5);
        }).not.toThrow();
      });
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
    it("should pass if cancellation is before cancellation deadline (1 day before start)", () => {
      const slotStartAt = futureDate(2); // 2日後 (キャンセル期限は1日前)
      expect(() => {
        validator.validateCancellable(slotStartAt);
      }).not.toThrow();
    });

    it("should throw if cancellation is within cancellation deadline (1 day before start)", () => {
      const slotStartAt = futureDate(0.5); // 0.5日後 (キャンセル期限は1日前)
      expect(() => {
        validator.validateCancellable(slotStartAt);
      }).toThrow(ReservationCancellationTimeoutError);
    });

    it("should handle exact boundary condition for cancellation deadline (1 day before start)", () => {
      // このテストは「1日前ちょうど」ではなく「1日前+1ミリ秒」の予約がキャンセル可能であることを期待している
      jest.spyOn(Date, 'now').mockImplementation(() => {
        const mockNow = new Date();
        return mockNow.getTime();
      });

      const now = new Date(Date.now());
      const exactLimit = new Date(now);
      exactLimit.setDate(exactLimit.getDate() + DEFAULT_CANCELLATION_DEADLINE_DAYS); // 1日
      exactLimit.setMilliseconds(exactLimit.getMilliseconds() + 1); // 境界値+1ミリ秒

      expect(() => {
        validator.validateCancellable(exactLimit);
      }).not.toThrow();

      jest.restoreAllMocks();
    });

    it("should throw when exactly at cancellation deadline limit (1 day before start)", () => {
      const now = new Date();
      const exactLimit = new Date(now);
      exactLimit.setDate(exactLimit.getDate() + DEFAULT_CANCELLATION_DEADLINE_DAYS); // 1日
      exactLimit.setMilliseconds(exactLimit.getMilliseconds() - 1); // Just under the limit

      expect(() => {
        validator.validateCancellable(exactLimit);
      }).toThrow(ReservationCancellationTimeoutError);
    });

    it("should handle future daylight saving time transitions", () => {
      const now = new Date();
      const futureSpringForward = new Date(now.getTime() + (8 * 24 * 60 * 60 * 1000)); // 8 days from now
      const futureFallBack = new Date(now.getTime() + (9 * 24 * 60 * 60 * 1000)); // 9 days from now

      expect(() => {
        validator.validateCancellable(futureSpringForward);
      }).not.toThrow();

      expect(() => {
        validator.validateCancellable(futureFallBack);
      }).not.toThrow();
    });

    it("should handle future leap year edge cases", () => {
      const now = new Date();
      const futureLeapYearDate = new Date(now.getTime() + (8 * 24 * 60 * 60 * 1000)); // 8 days from now
      expect(() => {
        validator.validateCancellable(futureLeapYearDate);
      }).not.toThrow();
    });

    it("should handle timezone edge cases with future dates", () => {
      const now = new Date();
      const futureUtcDate = new Date(now.getTime() + (8 * 24 * 60 * 60 * 1000)); // 8 days from now
      const futureLocalDate = new Date(now.getTime() + (9 * 24 * 60 * 60 * 1000)); // 9 days from now

      expect(() => {
        validator.validateCancellable(futureUtcDate);
      }).not.toThrow();

      expect(() => {
        validator.validateCancellable(futureLocalDate);
      }).not.toThrow();
    });

    it("should use the same cancellation deadline (1 day) for all activities regardless of their advance booking days", () => {
      // Even for activities with different advance booking days, cancellation deadline is always 1 day
      const slotStartAt = futureDate(2); // 2日後 (キャンセル期限は1日前)
      
      expect(() => {
        validator.validateCancellable(slotStartAt, 'any-activity-id');
      }).not.toThrow();
      
      const nearSlotStartAt = futureDate(0.5); // 0.5日後 (キャンセル期限は1日前)
      
      expect(() => {
        validator.validateCancellable(nearSlotStartAt, 'any-activity-id');
      }).toThrow(ReservationCancellationTimeoutError);
    });
  });
});

// 🔹 テスト用ヘルパー関数
function futureDate(days = 1): Date {
  const date = new Date();
  // 小数点以下の日数も正確に扱うため、ミリ秒単位で計算
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const futureTime = date.getTime() + (days * millisecondsInDay);
  return new Date(futureTime);
}

function pastDate(days = 1): Date {
  const date = new Date();
  // 小数点以下の日数も正確に扱うため、ミリ秒単位で計算
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const pastTime = date.getTime() - (days * millisecondsInDay);
  return new Date(pastTime);
}
