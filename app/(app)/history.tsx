import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { formatISO, getLastNDays } from "@/utils/dateFormat";

import Card from "@/components/ui/Card";
import Colors from "@/constants/Colors";
import { FeedingEntry } from "@/api/feeding-records";
import Header from "@/components/layouts/Header";
import HistoryCard from "@/components/history/HistoryCard";
import PawPrintBackground from "@/components/ui/PawPrintBackground";
import Theme from "@/constants/Theme";
import WeekSummary from "@/components/history/WeekSummary";
import { useFeeding } from "@/context/FeedingContext";

export default function HistoryScreen() {
  const { state, refreshData } = useFeeding();
  const [weeklyData, setWeeklyData] = useState<FeedingEntry[]>([]);

  // Refresh data when screen is focused
  useEffect(() => {
    refreshData();
  }, []);

  // Extract weekly data when history changes
  useEffect(() => {
    if (state.history.length > 0) {
      // Get dates for last 7 days
      const lastWeekDates = getLastNDays(7).map((date) => formatISO(date));

      // Filter entries for last week
      const weekEntries = state.history.filter((entry) =>
        lastWeekDates.includes(entry.date)
      );

      setWeeklyData(weekEntries);
    }
  }, [state.history]);

  return (
    <View style={styles.container}>
      <PawPrintBackground />

      <Header title="Feeding History" showDogImage={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {state.loading ? (
          <Card>
            <Text style={styles.loadingText}>Loading history...</Text>
          </Card>
        ) : (
          <>
            <WeekSummary entries={weeklyData} />

            {state.history.length > 0 ? (
              state.history
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((entry, index) => (
                  <HistoryCard key={entry.date} entry={entry} />
                ))
            ) : (
              <Card>
                <Text style={styles.emptyText}>
                  No feeding history available yet. Start tracking Poppy's meals
                  on the home screen!
                </Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Theme.spacing.xxl,
  },
  loadingText: {
    ...Theme.text.body,
    textAlign: "center",
    color: Colors.text.secondary,
  },
  emptyText: {
    ...Theme.text.body,
    textAlign: "center",
    color: Colors.text.secondary,
    padding: Theme.spacing.md,
  },
});
