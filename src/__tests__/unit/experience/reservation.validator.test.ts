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

    it("should pass if event is the day after tomorrow", () => {
      const slot = {
        hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
        startsAt: futureDateWithTime(2, 10, 0), // 2日後の午前10時
      } as any;
      const participantCount = 2;
      const remainingCapacity = 5;

      expect(() => {
        validator.validateReservable(slot, participantCount, remainingCapacity);
      }).not.toThrow();
    });

    it("should pass if event is tomorrow and current time is before 23:59", () => {
      // Mock current time to be 12:00 today
      const realDate = Date;
      const mockDate = new Date();
      mockDate.setHours(12, 0, 0, 0);
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        static now() {
          return mockDate.getTime();
        }
      } as any;

      const slot = {
        hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
        startsAt: futureDateWithTime(1, 10, 0), // 1日後の午前10時
      } as any;
      const participantCount = 2;
      const remainingCapacity = 5;

      expect(() => {
        validator.validateReservable(slot, participantCount, remainingCapacity);
      }).not.toThrow();

      // Restore original Date
      global.Date = realDate;
    });

    it("should throw if current time is past 23:59 the day before the event", () => {
      // Mock current time to be 00:01 on the day of the event
      const realDate = Date;
      const mockDate = new Date();
      mockDate.setDate(mockDate.getDate() + 1); // Set to tomorrow
      mockDate.setHours(0, 1, 0, 0); // 00:01
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        static now() {
          return mockDate.getTime();
        }
      } as any;

      const slot = {
        hostingStatus: OpportunitySlotHostingStatus.SCHEDULED,
        startsAt: futureDateWithTime(1, 10, 0), // 1日後の午前10時 (same day as mock date)
      } as any;
      const participantCount = 2;
      const remainingCapacity = 5;

      expect(() => {
        validator.validateReservable(slot, participantCount, remainingCapacity);
      }).toThrow(ValidationError);

      // Restore original Date
      global.Date = realDate;
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
    it("should pass if cancellation is before 23:59 the day before the event", () => {
      const slotStartAt = futureDateWithTime(2, 10, 0); // 2日後の午前10時
      expect(() => {
        validator.validateCancellable(slotStartAt);
      }).not.toThrow();
    });

    it("should throw if cancellation is on or after the day of the event", () => {
      const slotStartAt = futureDateWithTime(1, 0, 0); // 1日後の午前0時
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

function futureDateWithTime(days = 1, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function pastDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}
