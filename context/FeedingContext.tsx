import { AppState, AppStateStatus } from "react-native";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import {
  getDailyTarget,
  getFeedingHistory,
  getTodayTotal,
  setTodayTotal,
  updateDailyTarget,
} from "@/api/feeding-records";

import { FeedingEntry } from "@/api/feeding-records";
import { getTodayString } from "@/utils/dateFormat";
import { useAuth } from "@/auth/AuthContext";

// Types
type FeedingState = {
  todayData: FeedingEntry | null;
  history: FeedingEntry[];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  lastCheckedDate: string | null;
};

type FeedingAction =
  | { type: "SET_TODAY_DATA"; payload: FeedingEntry }
  | { type: "SET_HISTORY"; payload: FeedingEntry[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TOTAL"; payload: number }
  | { type: "RESET_TODAY" }
  | { type: "UPDATE_TARGET"; payload: number }
  | { type: "SET_LAST_UPDATED"; payload: number }
  | { type: "SET_LAST_CHECKED_DATE"; payload: string };

type FeedingContextType = {
  state: FeedingState;
  setTodayTotal: (amount: number) => Promise<void>;
  resetToday: () => Promise<void>;
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
  lastCheckedDate: null,
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
    case "SET_TOTAL":
      if (!state.todayData) return state;

      const updatedData = {
        ...state.todayData,
        amountFed: action.payload,
      };

      return { ...state, todayData: updatedData };
    case "RESET_TODAY":
      if (!state.todayData) return state;

      const resetData = {
        ...state.todayData,
        amountFed: 0,
      };

      return { ...state, todayData: resetData };
    case "UPDATE_TARGET":
      if (!state.todayData) return state;

      const targetData = {
        ...state.todayData,
        target: action.payload,
      };

      return { ...state, todayData: targetData };
    case "SET_LAST_UPDATED":
      return { ...state, lastUpdated: action.payload };
    case "SET_LAST_CHECKED_DATE":
      return { ...state, lastCheckedDate: action.payload };
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

  // Check for day change when app comes back into focus
  useEffect(() => {
    if (!user) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        const today = getTodayString();

        // If we haven't checked before or it's a new day, refresh data
        if (!state.lastCheckedDate || state.lastCheckedDate !== today) {
          refreshData();
          dispatch({ type: "SET_LAST_CHECKED_DATE", payload: today });
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Also check on initial mount
    const today = getTodayString();
    if (!state.lastCheckedDate || state.lastCheckedDate !== today) {
      refreshData();
      dispatch({ type: "SET_LAST_CHECKED_DATE", payload: today });
    }

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  // Set up polling interval
  useEffect(() => {
    if (!user) return;

    const POLLING_INTERVAL = 30000; // Poll every 30 seconds
    const intervalId = setInterval(() => {
      refreshData();
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [user]);

  // Check for day change
  useEffect(() => {
    if (!user || !state.todayData) return;

    const today = getTodayString();
    if (state.todayData.date !== today) {
      refreshData();
    }
  }, [state.todayData, user]);

  // Refresh data from API
  const refreshData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Get today's total and target
      const [total, target] = await Promise.all([
        getTodayTotal(),
        getDailyTarget(),
      ]);

      const today = getTodayString();
      const todayData: FeedingEntry = {
        date: today,
        amountFed: total,
        target: target,
        timestamp: Date.now(),
      };

      // Only update if the data is newer than our last update
      if (todayData.timestamp > state.lastUpdated) {
        dispatch({ type: "SET_TODAY_DATA", payload: todayData });
        dispatch({ type: "SET_LAST_UPDATED", payload: todayData.timestamp });
      }

      // Get history
      const history = await getFeedingHistory();
      dispatch({ type: "SET_HISTORY", payload: history });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load data" });
      console.error("Error loading data:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Set today's total
  const handleSetTodayTotal = async (amount: number) => {
    try {
      // Optimistically update the UI
      if (state.todayData) {
        const updatedData = {
          ...state.todayData,
          amountFed: amount,
        };
        dispatch({ type: "SET_TODAY_DATA", payload: updatedData });
      }

      // Then make the API call
      const newTotal = await setTodayTotal(amount);

      if (state.todayData) {
        const updatedData = {
          ...state.todayData,
          amountFed: newTotal,
        };
        dispatch({ type: "SET_TODAY_DATA", payload: updatedData });
      }
    } catch (error) {
      // Revert optimistic update on error
      if (state.todayData) {
        dispatch({ type: "SET_TODAY_DATA", payload: state.todayData });
      }
      dispatch({ type: "SET_ERROR", payload: "Failed to set today's total" });
      console.error("Error setting today's total:", error);
    }
  };

  // Reset today's feeding
  const handleResetToday = async () => {
    try {
      // Optimistically update the UI
      if (state.todayData) {
        const resetData = {
          ...state.todayData,
          amountFed: 0,
        };
        dispatch({ type: "SET_TODAY_DATA", payload: resetData });
      }

      // Then make the API call
      const newTotal = await setTodayTotal(0);

      if (state.todayData) {
        const resetData = {
          ...state.todayData,
          amountFed: newTotal,
        };
        dispatch({ type: "SET_TODAY_DATA", payload: resetData });
      }
    } catch (error) {
      // Revert optimistic update on error
      if (state.todayData) {
        dispatch({ type: "SET_TODAY_DATA", payload: state.todayData });
      }
      dispatch({ type: "SET_ERROR", payload: "Failed to reset today" });
      console.error("Error resetting today:", error);
    }
  };

  // Update target amount
  const handleUpdateTarget = async (target: number) => {
    try {
      // Optimistically update the UI
      if (state.todayData) {
        const targetData = {
          ...state.todayData,
          target: target,
        };
        dispatch({ type: "SET_TODAY_DATA", payload: targetData });
      }

      // Then make the API call
      const newTarget = await updateDailyTarget(target);

      if (state.todayData) {
        const targetData = {
          ...state.todayData,
          target: newTarget,
        };
        dispatch({ type: "SET_TODAY_DATA", payload: targetData });
      }
    } catch (error) {
      // Revert optimistic update on error
      if (state.todayData) {
        dispatch({ type: "SET_TODAY_DATA", payload: state.todayData });
      }
      dispatch({ type: "SET_ERROR", payload: "Failed to update target" });
      console.error("Error updating target:", error);
    }
  };

  return (
    <FeedingContext.Provider
      value={{
        state,
        setTodayTotal: handleSetTodayTotal,
        resetToday: handleResetToday,
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
