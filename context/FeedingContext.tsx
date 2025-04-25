import { AppState, AppStateStatus } from "react-native";
import {
  DailySummary,
  FeedingEntry,
  addFeeding,
  getDailyTarget,
  getFeedingHistory,
  getTodayFeedings,
  getTodayTotal,
  updateDailyTarget,
} from "@/api/feeding-records";
import React, { createContext, useContext, useEffect, useReducer } from "react";

import { getCurrentLocalDateString } from "@/utils/datetime";
import { useAuth } from "@/auth/AuthContext";

// Types
type FeedingState = {
  todayData: {
    amountFed: number;
    target: number;
    date: string;
    feedings: FeedingEntry[];
  } | null;
  history: DailySummary[];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
};

type FeedingAction =
  | {
      type: "SET_TODAY_DATA";
      payload: {
        amountFed: number;
        target: number;
        date: string;
        feedings: FeedingEntry[];
      };
    }
  | { type: "SET_HISTORY"; payload: DailySummary[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LAST_UPDATED"; payload: number };

type FeedingContextType = {
  state: FeedingState;
  addFeedingAmount: (amount: number) => Promise<void>;
  updateTarget: (target: number) => Promise<void>;
  refreshData: () => Promise<void>;
};

// Initial state
const initialState: FeedingState = {
  todayData: null,
  history: [],
  loading: true,
  error: null,
  lastUpdated: 0,
};

// Reducer
const feedingReducer = (
  state: FeedingState,
  action: FeedingAction
): FeedingState => {
  switch (action.type) {
    case "SET_TODAY_DATA":
      return { ...state, todayData: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_LAST_UPDATED":
      return { ...state, lastUpdated: action.payload };
    default:
      return state;
  }
};

// Context
const FeedingContext = createContext<FeedingContextType | undefined>(undefined);

// Provider component
export const FeedingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(feedingReducer, initialState);
  const { user } = useAuth();

  // Check for app state changes to refresh data
  useEffect(() => {
    if (!user) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        refreshData();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Initial load
    refreshData();

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Set up polling interval (every 24 hours)
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      refreshData();
    }, 86400000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Refresh data from API
  const refreshData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Fetch all required data in parallel
      const [total, target, feedings, history] = await Promise.all([
        getTodayTotal(),
        getDailyTarget(),
        getTodayFeedings(),
        getFeedingHistory(),
      ]);

      // Create today's data object
      const today = getCurrentLocalDateString();
      const todayData = {
        date: today,
        amountFed: total,
        target: target,
        feedings: feedings,
      };

      dispatch({ type: "SET_TODAY_DATA", payload: todayData });
      dispatch({ type: "SET_HISTORY", payload: history });
      dispatch({ type: "SET_LAST_UPDATED", payload: Date.now() });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load data" });
      console.error("Error loading data:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Add a new feeding
  const handleAddFeeding = async (amount: number) => {
    try {
      // Make API call
      const newFeeding = await addFeeding(amount);

      // Update state directly with new data
      if (state.todayData) {
        dispatch({
          type: "SET_TODAY_DATA",
          payload: {
            ...state.todayData,
            amountFed: newFeeding.total || state.todayData.amountFed,
            feedings: [...state.todayData.feedings, newFeeding],
          },
        });
        dispatch({ type: "SET_LAST_UPDATED", payload: Date.now() });
      } else {
        // If todayData somehow doesn't exist, do a full refresh
        await refreshData();
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add feeding" });
      console.error("Error adding feeding:", error);
    }
  };

  // Update target amount
  const handleUpdateTarget = async (target: number) => {
    try {
      // Make API call
      const newTarget = await updateDailyTarget(target);

      // Update state directly with new target
      if (state.todayData) {
        dispatch({
          type: "SET_TODAY_DATA",
          payload: {
            ...state.todayData,
            target: newTarget,
          },
        });
        dispatch({ type: "SET_LAST_UPDATED", payload: Date.now() });
      } else {
        // If todayData somehow doesn't exist, do a full refresh
        await refreshData();
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update target" });
      console.error("Error updating target:", error);
    }
  };

  return (
    <FeedingContext.Provider
      value={{
        state,
        addFeedingAmount: handleAddFeeding,
        updateTarget: handleUpdateTarget,
        refreshData,
      }}
    >
      {children}
    </FeedingContext.Provider>
  );
};

// Hook for using the context
export const useFeeding = (): FeedingContextType => {
  const context = useContext(FeedingContext);
  if (context === undefined) {
    throw new Error("useFeeding must be used within a FeedingProvider");
  }
  return context;
};
