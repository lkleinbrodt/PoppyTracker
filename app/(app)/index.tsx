import { ChartLineIcon, Target } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/Colors";
import Counter from "@/components/ui/Counter";
import FeedingHistoryCard from "@/components/ui/FeedingHistoryCard";
import FoodBowlGrid from "@/components/ui/FoodBowlGrid";
import Header from "@/components/layouts/Header";
import PawPrintBackground from "@/components/ui/PawPrintBackground";
import Theme from "@/constants/Theme";
import { useFeeding } from "@/context/FeedingContext";

export default function HomeScreen() {
  const { state, addFeedingAmount, updateTarget, refreshData } = useFeeding();
  const [date, setDate] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Update the date display
  useEffect(() => {
    // Get current date and format using our utilities
    setDate(
      new Date().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  // Handle adding a feeding amount (positive or negative)
  const handleFeedingAdjustment = (adjustment: number) => {
    if (adjustment !== 0) {
      addFeedingAmount(adjustment);
    }
  };

  // Handle updating target
  const handleTargetChange = (newTarget: number) => {
    if (state.todayData) {
      updateTarget(newTarget);
    }
  };

  // Get the subtitle for the header
  const getSubtitle = () => {
    if (state.loading) return "Loading...";
    return date;
  };

  const isOverTarget = state.todayData
    ? state.todayData.amountFed > state.todayData.target
    : false;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  return (
    <View style={styles.container}>
      <PawPrintBackground />

      <Header title="Poppy's Food" subtitle={getSubtitle()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {state.loading ? (
          <Card>
            <Text style={styles.loadingText}>Loading Poppy's data...</Text>
          </Card>
        ) : state.todayData ? (
          <>
            <Card>
              <View style={styles.headerRow}>
                <ChartLineIcon size={20} color={Colors.primary.main} />

                <Text style={styles.sectionTitle}>Today's Progress</Text>
              </View>

              <FoodBowlGrid cups={state.todayData.amountFed} size={36} />

              <View style={styles.trackerContainer}>
                <View style={styles.feedingContainer}>
                  <Counter
                    value={state.todayData.amountFed}
                    onChange={(amount) => handleFeedingAdjustment(amount)}
                    min={0.25}
                    max={2}
                    step={0.25}
                    loading={state.loading}
                    adjustmentMode={true}
                  />
                </View>

                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Target:</Text>
                    <Text style={styles.summaryValue}>
                      {state.todayData.target.toFixed(2)} cups
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Status:</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        isOverTarget ? styles.overTargetText : styles.targetMet,
                      ]}
                    >
                      {isOverTarget
                        ? `Over by ${(
                            state.todayData.amountFed - state.todayData.target
                          ).toFixed(2)} cups`
                        : state.todayData.amountFed >= state.todayData.target
                        ? "Target met! 🎉"
                        : `${(
                            state.todayData.target - state.todayData.amountFed
                          ).toFixed(2)} cups remaining`}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            <FeedingHistoryCard feedings={state.todayData.feedings} />

            <Card>
              <View style={styles.targetHeader}>
                <Target size={20} color={Colors.primary.main} />
                <Text style={styles.targetTitle}>Daily Target</Text>
              </View>

              <Counter
                value={state.todayData.target}
                onChange={handleTargetChange}
                min={0.25}
                max={10}
                step={0.25}
                loading={state.loading}
              />

              <Text style={styles.targetNote}>
                This will be your daily target until you change it again
              </Text>
            </Card>
          </>
        ) : (
          <Card>
            <Text style={styles.errorText}>
              Could not load feeding data. Please try again.
            </Text>
          </Card>
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
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  loadingText: {
    ...Theme.text.body,
    textAlign: "center",
    color: Colors.text.secondary,
  },
  errorText: {
    ...Theme.text.body,
    textAlign: "center",
    color: Colors.error.main,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.text.subtitle,
    color: Colors.primary.dark,
  },
  trashButton: {
    padding: Theme.spacing.xs,
  },
  trackerContainer: {
    alignItems: "center",
    marginTop: Theme.spacing.md,
  },
  totalText: {
    ...Theme.text.title,
    fontSize: 32,
    color: Colors.primary.dark,
    marginBottom: Theme.spacing.md,
  },
  feedingContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: Theme.spacing.sm,
  },
  feedingLabel: {
    ...Theme.text.body,
    color: Colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  amountText: {
    ...Theme.text.title,
    color: Colors.text.primary,
  },
  overTargetText: {
    color: Colors.error.main,
  },
  targetText: {
    ...Theme.text.body,
    color: Colors.text.secondary,
  },
  summaryContainer: {
    marginTop: Theme.spacing.lg,
    width: "100%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: Theme.spacing.xs,
  },
  summaryLabel: {
    ...Theme.text.body,
    color: Colors.text.secondary,
  },
  summaryValue: {
    ...Theme.text.body,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  targetMet: {
    color: Colors.success.main,
  },
  targetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  targetTitle: {
    ...Theme.text.subtitle,
    color: Colors.primary.dark,
    marginLeft: Theme.spacing.sm,
  },
  targetNote: {
    ...Theme.text.caption,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Theme.spacing.md,
  },
});
