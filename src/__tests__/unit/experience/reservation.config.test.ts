import "reflect-metadata";
import * as configModule from "@/application/domain/experience/reservation/config";

describe("Reservation Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getAdvanceBookingDays", () => {
    it("should return default days when no activity ID is provided", () => {
      const days = configModule.getAdvanceBookingDays();
      expect(days).toBe(configModule.DEFAULT_ADVANCE_BOOKING_DAYS);
    });

    it("should return default days when activity ID is not in config", () => {
      const days = configModule.getAdvanceBookingDays("non-existent-id");
      expect(days).toBe(configModule.DEFAULT_ADVANCE_BOOKING_DAYS);
    });

    it("should load config from environment variable", () => {
      // テスト用の環境変数を設定
      process.env.ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG = JSON.stringify({
        "test-activity-1": 0,
        "test-activity-2": 3,
        "test-activity-3": 14
      });

      // モジュールを再インポートして環境変数を読み込ませる
      jest.resetModules();
      const freshConfig = require("@/application/domain/experience/reservation/config");
      
      // 環境変数から読み込まれた設定が正しく使用されるか確認
      expect(freshConfig.getAdvanceBookingDays("test-activity-1")).toBe(0);
      expect(freshConfig.getAdvanceBookingDays("test-activity-2")).toBe(3);
      expect(freshConfig.getAdvanceBookingDays("test-activity-3")).toBe(14);
      expect(freshConfig.getAdvanceBookingDays("non-existent-id")).toBe(freshConfig.DEFAULT_ADVANCE_BOOKING_DAYS);
    });

    it("should handle invalid JSON in environment variable", () => {
      // 不正なJSON形式の環境変数を設定
      process.env.ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG = "invalid-json";

      // モジュールを再インポートして環境変数を読み込ませる
      jest.resetModules();
      const freshConfig = require("@/application/domain/experience/reservation/config");
      
      // エラーが発生しても正しくデフォルト値が使用されるか確認
      expect(freshConfig.getAdvanceBookingDays("any-activity-id")).toBe(freshConfig.DEFAULT_ADVANCE_BOOKING_DAYS);
    });
  });
});
