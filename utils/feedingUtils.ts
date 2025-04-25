import { FeedingEntry } from "@/api/feeding-records";
import { fromUTCToLocal } from "@/utils/datetime";

interface GroupedFeeding {
  timeChunk: string; // The formatted time of the earliest feeding in the chunk
  totalAmount: number; // Total amount in this chunk
  feedings: FeedingEntry[]; // All feedings in this chunk
  timestamp: number; // For sorting
}

/**
 * Formats a date into a readable time string (e.g., "8:00 AM")
 * Converts from UTC to local time for display
 */
export const formatTime = (dateString: string): string => {
  // Create date object from UTC string - browser automatically converts to local time
  const date = fromUTCToLocal(dateString);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

/**
 * Groups feedings into 15-minute chunks
 * @param feedings Array of feeding entries
 * @returns Array of grouped feedings
 */
export const groupFeedingsByNMinutes = (
  feedings: FeedingEntry[],
  minuteInterval: number = 30 // Default to 30 minutes if not specified
): GroupedFeeding[] => {
  // Sort feedings by date (newest first)
  const sortedFeedings = [...feedings].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const grouped: Record<string, GroupedFeeding> = {};

  sortedFeedings.forEach((feeding) => {
    try {
      // Parse the ISO string (which is in UTC) to a local date
      const date = fromUTCToLocal(feeding.timestamp);

      // Skip invalid dates
      if (isNaN(date.getTime())) {
        console.warn("Invalid timestamp encountered:", feeding.timestamp);
        return; // Skip this feeding
      }

      // At this point, date is in local time zone (browser converted it automatically)

      // Round down to nearest n-minute chunk
      const minutes = date.getMinutes();
      const roundedMinutes =
        Math.floor(minutes / minuteInterval) * minuteInterval;

      // Create a new date with the rounded minutes
      const roundedDate = new Date(date);
      roundedDate.setMinutes(roundedMinutes, 0, 0);

      // Create a unique key for this time chunk
      const timeKey = roundedDate.getTime().toString();

      // Add to grouped object or create new entry
      if (!grouped[timeKey]) {
        grouped[timeKey] = {
          timeChunk: formatTime(feeding.timestamp), // Use the actual feeding time
          totalAmount: 0,
          feedings: [],
          timestamp: roundedDate.getTime(),
        };
      } else {
        // Update timeChunk if this feeding is earlier than the current earliest
        const currentTime = new Date(feeding.timestamp).getTime();
        const earliestTime = new Date(
          grouped[timeKey].feedings[
            grouped[timeKey].feedings.length - 1
          ].timestamp
        ).getTime();
        if (currentTime < earliestTime) {
          grouped[timeKey].timeChunk = formatTime(feeding.timestamp);
        }
      }

      grouped[timeKey].totalAmount += feeding.amount;
      grouped[timeKey].feedings.push(feeding);
    } catch (error) {
      console.error("Error parsing timestamp:", error);
      // Skip this feeding
    }
  });

  // Convert the grouped object to an array and sort by timestamp (newest first)
  return Object.values(grouped).sort((a, b) => b.timestamp - a.timestamp);
};
