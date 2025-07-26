/**
 * Activity-specific booking configuration
 * Maps activity IDs to the number of days required for advance booking
 */
export interface ActivityBookingConfig {
    [activityId: string]: number;
}

// NOTE: 予約受付日数カスタムニーズが今後不明のため、現在は環境変数で管理しているが、多ければデータベースで管理を検討する

/**
 * Default advance booking days for activities without specific configuration
 */
export const DEFAULT_ADVANCE_BOOKING_DAYS = 7;

/**
 * Default activity booking configuration (used as fallback if env var is not set)
 */
const DEFAULT_ACTIVITY_BOOKING_CONFIG: ActivityBookingConfig = {
    // Default configurations for development/testing
    "cmcak8udp019l8zwh4jvmuomp": 0, // 当日開催直前まで受付
    "cmcak4qt600lu8zwhdzcuynre": 1, // 1日前まで受付可能
    "cmcakai1a01jm8zwh7323vpzn": 2, // 2日前まで受付可能
};

/**
 * Get activity booking configuration from environment variable
 * Environment variable format: {"activity-id-1":0,"activity-id-2":1,"activity-id-3":7}
 */
let configFromEnv: ActivityBookingConfig = {};
try {
    const envConfig = process.env.ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG;
    if (envConfig) {
        configFromEnv = JSON.parse(envConfig);
        console.log('Loaded activity advance booking days config from environment variable');
    } else {
        console.log('No environment variable for activity advance booking days config found, using defaults');
    }
} catch (error) {
    console.error('Error parsing ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG environment variable:', error);
}

/**
 * Combined activity booking configuration
 * Uses environment variable config if available, falls back to defaults
 */
export const ACTIVITY_BOOKING_CONFIG: ActivityBookingConfig = 
    Object.keys(configFromEnv).length > 0 ? configFromEnv : DEFAULT_ACTIVITY_BOOKING_CONFIG;

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
