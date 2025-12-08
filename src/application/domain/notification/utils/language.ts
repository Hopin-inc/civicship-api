import { Language } from "@prisma/client";
import dayjs from "dayjs";
import "dayjs/locale/ja.js";
import "dayjs/locale/en.js";

/**
 * Convert Language enum to locale string for Intl APIs
 */
export function getLocaleString(language: Language): string {
  return language === Language.JA ? "ja-JP" : "en-US";
}

/**
 * Convert Language enum to dayjs locale string
 */
export function getDayjsLocale(language: Language): string {
  return language === Language.JA ? "ja" : "en";
}

/**
 * Format a number according to the user's language preference
 */
export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(getLocaleString(language)).format(value);
}

/**
 * Format a date according to the user's language preference
 */
export function formatDate(date: Date, format: string, language: Language): string {
  const locale = getDayjsLocale(language);
  return dayjs(date).locale(locale).format(format);
}
