/**
 * This file contains the API integration for feeding records
 * For future implementation with a backend server
 */

import { apiClient } from "./client";

export interface FeedingEntry {
  date: string; // YYYY-MM-DD format
  amountFed: number; // Number of cups
  target: number; // Target cups per day
  timestamp: number; // Unix timestamp
}
/**
 * Set today's food total
 * @param amount New total amount
 * @returns Promise with the new total
 */
export const setTodayTotal = async (amount: number): Promise<number> => {
  const response = await apiClient.post<{ total: number }>(
    "/poppy/daily/total",
    { amount }
  );

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to set today's total");
  }

  return response.data.total;
};

/**
 * Get today's food total
 * @returns Promise with today's total
 */
export const getTodayTotal = async (): Promise<number> => {
  const response = await apiClient.get<{ total: number }>("/poppy/daily/total");

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to get today's total");
  }

  return response.data.total;
};

/**
 * Get the daily target amount
 * @returns Promise with daily target
 */
export const getDailyTarget = async (): Promise<number> => {
  const response = await apiClient.get<{ target: number }>(
    "/poppy/settings/target"
  );

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to get daily target");
  }

  return response.data.target;
};

/**
 * Update the daily target amount
 * @param target New target amount
 * @returns Promise with updated target
 */
export const updateDailyTarget = async (target: number): Promise<number> => {
  const response = await apiClient.post<{ target: number }>(
    "/poppy/settings/target",
    { target }
  );

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to update daily target");
  }

  return response.data.target;
};

/**
 * Get historical feeding data
 * @returns Promise with feeding history array
 */
export const getFeedingHistory = async (): Promise<FeedingEntry[]> => {
  const response = await apiClient.get<FeedingEntry[]>("/poppy/history");

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to get feeding history");
  }

  return response.data;
};

/**
 * Submit a feeding record to API
 * @param record The feeding record to submit
 * @returns Promise with API response
 */
export const submitFeedingRecord = async (
  record: FeedingEntry
): Promise<FeedingEntry> => {
  const response = await apiClient.post<FeedingEntry>(
    "/poppy/feeding-records",
    record
  );

  if (!response.ok || !response.data) {
    throw new Error(
      response.error?.message || "Failed to submit feeding record"
    );
  }

  return response.data;
};

/**
 * Get app settings from API
 * @returns Promise with settings object
 */
export const getSettings = async (): Promise<any> => {
  const response = await apiClient.get<any>("/poppy/settings");

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to get settings");
  }

  return response.data;
};

/**
 * Update app settings in API
 * @param settings The settings object to update
 * @returns Promise with API response
 */
export const updateSettings = async (settings: any): Promise<any> => {
  const response = await apiClient.put<any>("/poppy/settings", settings);

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to update settings");
  }

  return response.data;
};
