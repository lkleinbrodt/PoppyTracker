/**
 * Date utilities for consistent date handling across the app
 * Backend uses UTC, frontend displays in local time
 */

/**
 * Parses an ISO date string (YYYY-MM-DD) to a Date object
 * @param dateString ISO date string in YYYY-MM-DD format
 * @returns Date object representing that date in local time
 */
export function parseISODate(dateString: string): Date {
  // Parse the YYYY-MM-DD string into year, month, day components
  const [year, month, day] = dateString.split("-").map(Number);

  // Create date with the components in local timezone
  // We use noon to avoid any daylight saving time issues
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);

  return date;
}

/**
 * Get today's date in YYYY-MM-DD format in local timezone
 * @returns Today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a date for user-friendly display
 * Shows "Today", "Yesterday", or formatted date
 * @param date Date object or YYYY-MM-DD string
 * @returns User-friendly date string
 */
export function format(date: Date | string): string {
  // Ensure we're working with a Date object
  const localDate = typeof date === "string" ? parseISODate(date) : date;

  // Create today and yesterday dates at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Create comparison date at midnight
  const compareDate = new Date(localDate);
  compareDate.setHours(0, 0, 0, 0);

  // Compare the dates
  if (compareDate.getTime() === today.getTime()) {
    return "Today";
  }

  if (compareDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Format for other dates
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
  };

  return localDate.toLocaleDateString(undefined, options);
}

/**
 * Format date for display in headers
 */
export function formatHeader(date: Date | string): string {
  const localDate = typeof date === "string" ? parseISODate(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  return localDate.toLocaleDateString(undefined, options);
}

/**
 * Get a date range for the last N days
 * @returns Array of YYYY-MM-DD strings
 */
export function getLastNDays(days: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(formatISO(date));
  }
  return result;
}

/**
 * Format a date in YYYY-MM-DD format
 * @param date Date object
 * @returns YYYY-MM-DD string
 */
export function formatISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convert a local Date to a UTC ISO string for sending to the backend
 * @param date Local date
 * @returns UTC ISO string
 */
export function toUTCString(date: Date): string {
  return date.toISOString();
}

/**
 * Convert a UTC ISO string from the backend to a local Date
 * @param utcString UTC ISO string
 * @returns Local Date object
 */
export function fromUTCToLocal(utcString: string): Date {
  return new Date(utcString);
}
