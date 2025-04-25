/**
 * Utility functions for handling date/time operations with proper timezone support
 */

/**
 * Converts a local date to UTC ISO string for sending to the backend
 * @param date Local date to convert
 * @returns UTC ISO string
 */
export function toUTC(date: Date): string {
  return date.toISOString();
}

/**
 * Converts a UTC ISO string from the backend to local date for display
 * @param utcString UTC ISO string
 * @returns Local date
 */
export function fromUTCToLocal(utcString: string): Date {
  // If timestamp doesn't have a timezone indicator, assume it's UTC and add 'Z'
  const timestamp = utcString.endsWith("Z") ? utcString : `${utcString}Z`;

  // Create date object from properly formatted UTC string
  // JavaScript will automatically convert this to local time when displayed
  return new Date(timestamp);
}

/**
 * Formats a UTC ISO string to a localized time string
 * @param utcString UTC ISO string
 * @returns Formatted local time string (e.g., "8:00 AM")
 */
export function formatLocalTime(utcString: string): string {
  const date = fromUTCToLocal(utcString);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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
 * Gets the local date string (YYYY-MM-DD) for today
 * @returns Local date string in YYYY-MM-DD format
 */
export function getCurrentLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets the local date string (YYYY-MM-DD) for a given UTC timestamp
 * @param utcString UTC ISO string
 * @returns Local date string in YYYY-MM-DD format
 */
export function getLocalDateStringFromUTC(utcString: string): string {
  const date = fromUTCToLocal(utcString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a UTC timestamp is today in local timezone
 * @param utcString UTC ISO string
 * @returns boolean indicating if the date is today
 */
export function isToday(utcString: string): boolean {
  const date = fromUTCToLocal(utcString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Checks if a UTC timestamp is yesterday in local timezone
 * @param utcString UTC ISO string
 * @returns boolean indicating if the date is yesterday
 */
export function isYesterday(utcString: string): boolean {
  const date = fromUTCToLocal(utcString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
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

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    result.push(`${year}-${month}-${day}`);
  }
  return result;
}
