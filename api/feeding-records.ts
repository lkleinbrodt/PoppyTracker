/**
 * API integration for feeding records
 */

import { apiClient } from "./client";

export interface FeedingEntry {
  id: number;
  timestamp: string; // ISO format
  amount: number;
  last_updated_by: string | null;
  date?: string;
  total?: number;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD format
  amountFed: number;
  target: number;
  feedings: FeedingEntry[];
}

/**
 * Get all of today's feeding entries
 */
export const getTodayFeedings = async (): Promise<FeedingEntry[]> => {
  const response = await apiClient.get<FeedingEntry[]>("/poppy/daily/feedings");

  if (!response.ok || !response.data) {
    throw new Error(
      response.error?.message || "Failed to get today's feedings"
    );
  }

  return response.data;
};

/**
 * Get today's food total
 */
//TODO: you dont really need to hit the backend for this, you can calculate it from the daily feedings
export const getTodayTotal = async (): Promise<number> => {
  const response = await apiClient.get<{ total: number }>("/poppy/daily/total");

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to get today's total");
  }

  return response.data.total;
};

/**
 * Get the daily target amount
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
 */
export const getFeedingHistory = async (): Promise<DailySummary[]> => {
  const response = await apiClient.get<DailySummary[]>("/poppy/history");

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to get feeding history");
  }

  return response.data;
};

/**
 * Add a new feeding entry
 */
export const addFeeding = async (amount: number): Promise<FeedingEntry> => {
  const response = await apiClient.post<FeedingEntry>("/poppy/feeding", {
    amount,
  });

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message || "Failed to add feeding");
  }

  return response.data;
};
