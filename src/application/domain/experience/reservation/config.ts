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
export const DEFAULT_CANCELLATION_DEADLINE_DAYS = 1;

/**
 * Activity booking configuration
 * Currently empty; retained for future per-activity overrides.
 */
export const ACTIVITY_BOOKING_CONFIG: ActivityBookingConfig = {};

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
