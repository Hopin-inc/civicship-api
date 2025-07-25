/**
 * Activity-specific booking configuration
 * Maps activity IDs to the number of days required for advance booking
 */
export interface ActivityBookingConfig {
    [activityId: string]: number;
}

// NOTE: 現在はハードコーディングで管理しているが、将来的にカスタムすることが多ければデータベースで管理することを検討
// TODO: FE にも設定ファイルがあるため、あわせて更新が必要
// - civicship-portal/src/config/activityBookingConfig.ts

/**
 * Configuration for activity-specific advance booking days
 * Add activity-specific configurations here
 */
export const ACTIVITY_BOOKING_CONFIG: ActivityBookingConfig = {
    // Add activity-specific configurations here
    // Example configurations:
    // "activity-urgent-123": 1,         // 1 day advance booking
    // "activity-workshop-456": 14,      // 14 days advance booking
    // "activity-special-789": 3,        // 3 days advance booking
    // --- dev 環境での確認用 
    "cmcak8udp019l8zwh4jvmuomp": 0, // 当日開催直前まで受付
    "cmcak4qt600lu8zwhdzcuynre": 1, // 1日前まで受付可能
    "cmcakai1a01jm8zwh7323vpzn": 2, // 2日前まで受付可能
};

/**
 * Default advance booking days for activities without specific configuration
 */
export const DEFAULT_ADVANCE_BOOKING_DAYS = 7;

/**
 * Get the advance booking days for a specific activity
 * @param activityId The activity ID to get booking lead time for
 * @returns Number of days in advance booking is required
 */
export const getAdvanceBookingDays = (activityId?: string): number => {
    if (!activityId) {
        return DEFAULT_ADVANCE_BOOKING_DAYS;
    }

    return ACTIVITY_BOOKING_CONFIG[activityId] ?? DEFAULT_ADVANCE_BOOKING_DAYS;
};
