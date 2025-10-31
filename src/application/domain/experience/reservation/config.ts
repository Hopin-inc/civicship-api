import logger from "@/infrastructure/logging";

/**
 * Activity-specific booking configuration
 * Maps activity IDs to the number of days required for advance booking
 */
export interface ActivityBookingConfig {
    [activityId: string]: number;
}


/**
 * Default advance booking days for activities without specific configuration
 */
export const DEFAULT_ADVANCE_BOOKING_DAYS = 2;

/**
 * Default cancellation deadline days before activity start
 */
export const DEFAULT_CANCELLATION_DEADLINE_DAYS = 2;

/**
 * Activity booking configuration from environment variable
 * 現在は一律設定のため環境変数は未設定（削除済み）
 * 必要に応じて個別アクティビティIDと日数を設定可能
 * Environment variable format: {"activity-id-1":0,"activity-id-2":1,"activity-id-3":7}
 */
let configFromEnv: ActivityBookingConfig = {};
try {
    const envConfig = process.env.ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG;
    if (envConfig) {
        configFromEnv = JSON.parse(envConfig);
        logger.info('Loaded activity advance booking days config from environment variable');
    } else {
        logger.info('No environment variable for activity advance booking days config found, using defaults');
    }
} catch (error) {
    logger.error('Error parsing ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG environment variable:', error);
}

/**
 * Activity booking configuration from environment variable
 * If no environment variable is set, uses an empty configuration
 */
export const ACTIVITY_BOOKING_CONFIG: ActivityBookingConfig = configFromEnv;

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
