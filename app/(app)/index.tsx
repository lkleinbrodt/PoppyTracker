import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/Colors";
import Counter from "@/components/ui/Counter";
import FoodBowlGrid from "@/components/ui/FoodBowlGrid";
import Header from "@/components/layouts/Header";
import PawPrintBackground from "@/components/ui/PawPrintBackground";
import { Target } from "lucide-react-native";
import Theme from "@/constants/Theme";
import { formatHeader } from "@/utils/dateFormat";
import { useFeeding } from "@/context/FeedingContext";

export default function HomeScreen() {
  const { state, setTodayTotal, resetToday, updateTarget } = useFeeding();
  const [date, setDate] = useState("");

  // Update the date display
  useEffect(() => {
    setDate(formatHeader(new Date()));
  }, []);

  // Handle setting food amount
  const handleAmountChange = (newAmount: number) => {
    if (newAmount >= 0) {
      setTodayTotal(newAmount);
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
    if (!state.todayData) return date;

    const percentFed =
      (state.todayData.amountFed / state.todayData.target) * 100;
    return `${Math.round(percentFed)}% of daily goal`;
  };

  const isOverTarget = state.todayData
    ? state.todayData.amountFed > state.todayData.target
    : false;
  console.log(state);
  return (
    <View style={styles.container}>
      <PawPrintBackground />

      <Header title="Poppy's Food" subtitle={date} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {state.loading ? (
          <Card>
            <Text style={styles.loadingText}>Loading Poppy's data...</Text>
          </Card>
        ) : state.todayData ? (
          <>
            <Card>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Today's Progress</Text>
              </View>

              <FoodBowlGrid cups={state.todayData.amountFed} size={36} />

              <View style={styles.trackerContainer}>
                <Counter
                  value={state.todayData.amountFed}
                  onChange={handleAmountChange}
                  min={0}
                  max={state.todayData.target * 2}
                  step={0.25}
                  loading={state.loading}
                />

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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
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
