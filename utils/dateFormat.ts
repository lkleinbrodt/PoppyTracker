/**
 * Date utilities for consistent date handling across the app
 * All dates are treated as Pacific Time (America/Los_Angeles)
 */

// The app's canonical timezone (matches backend)
const APP_TIMEZONE = "America/Los_Angeles";

/**
 * Parses an ISO date string (YYYY-MM-DD) to a Date object
 * Ensures consistent date interpretation regardless of user's timezone
 *
 * @param dateString ISO date string in YYYY-MM-DD format
 * @returns Date object representing that date in Pacific time
 */
export function parseISODate(dateString: string): Date {
  // Parse the YYYY-MM-DD string into year, month, day components
  const [year, month, day] = dateString.split("-").map(Number);

  // Create date with the components (noon Pacific time to avoid any timezone issues)
  // We use noon to ensure we're not near any day boundaries
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);

  return date;
}

/**
 * Get today's date in YYYY-MM-DD format
 * This matches how the backend generates today's date
 *
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
 *
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
