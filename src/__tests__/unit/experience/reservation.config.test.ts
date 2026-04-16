import "reflect-metadata";
import * as configModule from "@/application/domain/experience/reservation/config";

describe("Reservation Config", () => {
  describe("getAdvanceBookingDays", () => {
    it("should return default days when no activity ID is provided", () => {
      const days = configModule.getAdvanceBookingDays();
      expect(days).toBe(configModule.DEFAULT_ADVANCE_BOOKING_DAYS);
    });

    it("should return default days when activity ID is not in config", () => {
      const days = configModule.getAdvanceBookingDays("non-existent-id");
      expect(days).toBe(configModule.DEFAULT_ADVANCE_BOOKING_DAYS);
    });
  });
});
