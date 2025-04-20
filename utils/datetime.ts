/**
 * Utility functions for handling date/time operations with proper timezone support
 */

/**
 * Converts a local date to UTC ISO string
 * @param date Local date to convert
 * @returns UTC ISO string
 */
export function toUTC(date: Date): string {
  return date.toISOString();
}

/**
 * Converts a UTC ISO string to local date
 * @param utcString UTC ISO string
 * @returns Local date
 */
export function fromUTCToLocal(utcString: string): Date {
  return new Date(utcString);
}

/**
 * Formats a UTC ISO string to a localized date string
 * @param utcString UTC ISO string
 * @returns Formatted local date string
 */
export function formatLocalDate(utcString: string): string {
  const date = fromUTCToLocal(utcString);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Gets the local date string (YYYY-MM-DD) for grouping entries
 * @param utcString UTC ISO string
 * @returns Local date string in YYYY-MM-DD format
 */
export function getLocalDateStringForGrouping(utcString: string): string {
  const date = fromUTCToLocal(utcString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets the current local date string (YYYY-MM-DD)
 * @returns Current local date string in YYYY-MM-DD format
 */
export function getCurrentLocalDateString(): string {
  return getLocalDateStringForGrouping(new Date().toISOString());
}

/**
 * Checks if a date is today in local timezone
 * @param utcString UTC ISO string
 * @returns boolean indicating if the date is today
 */
export function isToday(utcString: string): boolean {
  const date = fromUTCToLocal(utcString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Checks if a date is yesterday in local timezone
 * @param utcString UTC ISO string
 * @returns boolean indicating if the date is yesterday
 */
export function isYesterday(utcString: string): boolean {
  const date = fromUTCToLocal(utcString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Gets a date range for the last N days in local timezone
 * @param days Number of days to get
 * @returns Array of local date strings in YYYY-MM-DD format
 */
export function getLastNDaysLocal(days: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(getLocalDateStringForGrouping(date.toISOString()));
  }
  return result;
}
