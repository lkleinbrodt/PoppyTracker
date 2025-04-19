// Format date in a user-friendly way
export function format(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Format for other dates
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString(undefined, options);
}

// Format date for display in headers
export function formatHeader(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  
  return date.toLocaleDateString(undefined, options);
}

// Get a date range for the last N days
export function getLastNDays(days: number): Date[] {
  const result: Date[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(date);
  }
  return result;
}

// Format a date in YYYY-MM-DD format
export function formatISO(date: Date): string {
  return date.toISOString().split('T')[0];
}