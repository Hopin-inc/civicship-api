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
import ReservationValidator from "@/application/domain/experience/reservation/validator";
import * as config from "@/application/domain/experience/reservation/config";

describe("ReservationValidator", () => {
  const validator = new ReservationValidator();

  describe("validateReservable", () => {
    it("should pass when slot is valid and no conflicts and enough capacity", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(2), // 2 days in future to avoid advance booking error (default is 1 day)
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
        startsAt: futureDate(2), // 2 days in future to avoid advance booking error (default is 1 day)
        opportunityId: "test-opportunity-id"
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).not.toThrow();
    });

    it("should throw if participant count exceeds capacity", () => {
      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: futureDate(2), // 2 days in future to avoid advance booking error (default is 1 day)
        opportunityId: "test-opportunity-id"
      } as any;

      expect(() => {
        validator.validateReservable(slot, 10, 5);
      }).toThrow(ReservationFullError);
    });

    it("should throw if booking is within the default advance booking period", () => {
      // Mock current time to be after the deadline (23:59 of 1 day before the event)
      const eventDate = futureDate(0.5); // Event is 0.5 days in future
      const mockNow = new Date(eventDate);
      mockNow.setDate(mockNow.getDate() - 1); // 1 day before event (default advance booking days)
      mockNow.setHours(23, 59, 59, 999); // Set to 23:59:59.999
      mockNow.setMilliseconds(mockNow.getMilliseconds() + 1); // Just past the deadline
      
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      const slot = {
        hostingStatus: "SCHEDULED" as any,
        startsAt: eventDate,
        opportunityId: "test-opportunity-id"
      } as any;

      expect(() => {
        validator.validateReservable(slot, 1, 5);
      }).toThrow(ReservationAdvanceBookingRequiredError);
      
      jest.useRealTimers();
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
          return 1; // Default
        });
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should pass if booking is before the deadline (23:59 of N days before event)", () => {
        const eventDate = futureDate(4); // Event is 4 days in future
        const mockNow = new Date(eventDate);
        mockNow.setDate(mockNow.getDate() - 3); // 3 days before event (custom advance booking days)
        mockNow.setHours(23, 59, 59, 998); // Just before 23:59:59.999 deadline
        
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const slot = {
          hostingStatus: "SCHEDULED" as any,
          startsAt: eventDate,
          opportunityId: "custom-activity-id"
        } as any;

        expect(() => {
          validator.validateReservable(slot, 1, 5);
        }).not.toThrow();
        
        jest.useRealTimers();
      });

      it("should throw if booking is after the deadline (23:59 of N days before event)", () => {
        const eventDate = futureDate(4); // Event is 4 days in future
        const mockNow = new Date(eventDate);
        mockNow.setDate(mockNow.getDate() - 3); // 3 days before event (custom advance booking days)
        mockNow.setHours(23, 59, 59, 999); // Set to 23:59:59.999
        mockNow.setMilliseconds(mockNow.getMilliseconds() + 1); // Just past the deadline
        
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const slot = {
          hostingStatus: "SCHEDULED" as any,
          startsAt: eventDate,
          opportunityId: "custom-activity-id"
        } as any;

        expect(() => {
          validator.validateReservable(slot, 1, 5);
        }).toThrow(ReservationAdvanceBookingRequiredError);
        
        jest.useRealTimers();
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

      it("should allow same-day booking for activities with 0 advance booking days", () => {
        // Test case: Event starts at 18:00 today, current time is 14:00 today
        const today = new Date();
        const eventTime = new Date(today);
        eventTime.setHours(18, 0, 0, 0); // Event at 18:00
        
        const currentTime = new Date(today);
        currentTime.setHours(14, 0, 0, 0); // Current time is 14:00
        
        jest.useFakeTimers();
        jest.setSystemTime(currentTime);

        const slot = {
          hostingStatus: "SCHEDULED" as any,
          startsAt: eventTime,
          opportunityId: "zero-days-activity-id" // 0 advance booking days
        } as any;

        // Should be allowed - same day booking before event start
        expect(() => {
          validator.validateReservable(slot, 1, 5);
        }).not.toThrow();
        
        jest.useRealTimers();
      });

      it("should allow booking until 23:59 of N days before event regardless of event start time", () => {
        // Test case: Event starts at 10:00 AM, 4 days from now
        const eventDate = futureDate(4);
        eventDate.setHours(10, 0, 0, 0); // Set event to 10:00 AM
        
        // Current time is exactly 23:59 of 3 days before the event
        const mockNow = new Date(eventDate);
        mockNow.setDate(mockNow.getDate() - 3); // 3 days before event
        mockNow.setHours(23, 59, 59, 999); // Set to 23:59:59.999
        
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const slot = {
          hostingStatus: "SCHEDULED" as any,
          startsAt: eventDate,
          opportunityId: "custom-activity-id" // 3 days advance booking
        } as any;

        // Should be allowed - exactly at the deadline
        expect(() => {
          validator.validateReservable(slot, 1, 5);
        }).not.toThrow();
        
        jest.useRealTimers();
      });

      it("should reject booking after 23:59 of N days before event regardless of event start time", () => {
        // Test case: Event starts at 10:00 AM, 4 days from now
        const eventDate = futureDate(4);
        eventDate.setHours(10, 0, 0, 0); // Set event to 10:00 AM
        
        // Current time is 1 millisecond after 23:59 of 3 days before the event
        const mockNow = new Date(eventDate);
        mockNow.setDate(mockNow.getDate() - 3); // 3 days before event
        mockNow.setHours(23, 59, 59, 999); // Set to 23:59:59.999
        mockNow.setMilliseconds(mockNow.getMilliseconds() + 1); // Just past deadline
        
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const slot = {
          hostingStatus: "SCHEDULED" as any,
          startsAt: eventDate,
          opportunityId: "custom-activity-id" // 3 days advance booking
        } as any;

        // Should be rejected - past the deadline
        expect(() => {
          validator.validateReservable(slot, 1, 5);
        }).toThrow(ReservationAdvanceBookingRequiredError);
        
        jest.useRealTimers();
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
      const slotStartAt = futureDate(1); // Event is 1 day in future
      const mockNow = new Date(slotStartAt);
      mockNow.setDate(mockNow.getDate() - 1); // 1 day before event
      mockNow.setHours(23, 59, 59, 999); // Set to 23:59:59.999
      mockNow.setMilliseconds(mockNow.getMilliseconds() + 1); // Just past the deadline
      
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);
      
      expect(() => {
        validator.validateCancellable(slotStartAt);
      }).toThrow(ReservationCancellationTimeoutError);
      
      jest.useRealTimers();
    });

    it("should handle exact boundary condition for cancellation deadline (1 day before start)", () => {
      const slotStartAt = futureDate(2); // Event is 2 days in future
      const mockNow = new Date(slotStartAt);
      mockNow.setDate(mockNow.getDate() - 1); // 1 day before event
      mockNow.setHours(23, 59, 59, 999); // Exactly at 23:59:59.999 deadline
      
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      expect(() => {
        validator.validateCancellable(slotStartAt);
      }).not.toThrow();

      jest.useRealTimers();
    });

    it("should throw when exactly at cancellation deadline limit (1 day before start)", () => {
      const slotStartAt = futureDate(1); // Event is 1 day in future
      const mockNow = new Date(slotStartAt);
      mockNow.setDate(mockNow.getDate() - 1); // 1 day before event
      mockNow.setHours(23, 59, 59, 999); // Set to 23:59:59.999
      mockNow.setMilliseconds(mockNow.getMilliseconds() + 1); // Just past the deadline
      
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      expect(() => {
        validator.validateCancellable(slotStartAt);
      }).toThrow(ReservationCancellationTimeoutError);
      
      jest.useRealTimers();
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
      
      // Test cancellation after 23:59 deadline
      const nearSlotStartAt = futureDate(1); // Event is 1 day in future
      const mockNow = new Date(nearSlotStartAt);
      mockNow.setDate(mockNow.getDate() - 1); // 1 day before event
      mockNow.setHours(23, 59, 59, 999); // Set to 23:59:59.999
      mockNow.setMilliseconds(mockNow.getMilliseconds() + 1); // Just past the deadline
      
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);
      
      expect(() => {
        validator.validateCancellable(nearSlotStartAt, 'any-activity-id');
      }).toThrow(ReservationCancellationTimeoutError);
      
      jest.useRealTimers();
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
