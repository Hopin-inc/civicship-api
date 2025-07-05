import { parseISO, isAfter, addDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

// Constants
export const JST_TIMEZONE = "Asia/Tokyo";

// Timezone utilities
export const toJST = (date: Date): Date => {
  return toZonedTime(date, JST_TIMEZONE);
};

export const formatInJST = (date: Date, formatStr: string): string => {
  return formatInTimeZone(date, JST_TIMEZONE, formatStr);
};

export const getJSTDateString = (date: Date): string => {
  return formatInTimeZone(date, JST_TIMEZONE, "yyyy-MM-dd");
};

export const parseJSTDateString = (dateStr: string, timeStr: string = "00:00:00"): Date => {
  return parseISO(`${dateStr}T${timeStr}`);
};

export const getStartOfDayInJST = (date: Date): Date => {
  const dateInJST = formatInJST(date, "yyyy-MM-dd");
  return parseISO(`${dateInJST}T00:00:00`);
};

export const getTomorrowStartInJST = (): Date => {
  const now = new Date();
  const todayInJST = getJSTDateString(now);
  const tomorrow = parseISO(`${todayInJST}T00:00:00`);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const isAfterInJST = (date: Date, dateToCompare: Date): boolean => {
  const dateInJST = toJST(date);
  const dateToCompareInJST = toJST(dateToCompare);
  return isAfter(dateInJST, dateToCompareInJST);
};

export const addDaysInJST = (date: Date, amount: number): Date => {
  const dateInJST = toJST(date);
  return addDays(dateInJST, amount);
};
