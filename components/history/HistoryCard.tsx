import { StyleSheet, Text, View } from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/Colors";
import { DailySummary } from "@/api/feeding-records";
import React from "react";
import Theme from "@/constants/Theme";
import { format } from "@/utils/dateFormat";

// Small cup component for history display
const SmallCupIndicator = ({ filled }: { filled: boolean }) => (
  <View
    style={[
      styles.smallCup,
      { backgroundColor: filled ? Colors.secondary.main : "transparent" },
    ]}
  />
);

type HistoryCardProps = {
  entry: DailySummary;
};

const HistoryCard: React.FC<HistoryCardProps> = ({ entry }) => {
  // Format the date for display
  const formattedDate = format(entry.date);

  // Generate cup indicators
  const renderCupIndicators = () => {
    const cups = [];
    const totalCups = Math.ceil(entry.target);

    for (let i = 0; i < totalCups; i++) {
      cups.push(
        <SmallCupIndicator key={i} filled={i < Math.floor(entry.amountFed)} />
      );
    }

    return cups;
  };

  // Calculate percentage of target reached
  const percentComplete = Math.min(100, (entry.amountFed / entry.target) * 100);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{entry.amountFed.toFixed(2)}</Text>
          <Text style={styles.unit}>cups</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.cupIndicators}>{renderCupIndicators()}</View>
        <View style={styles.percentContainer}>
          <Text
            style={[
              styles.percent,
              percentComplete >= 100 ? styles.complete : null,
            ]}
          >
            {Math.round(percentComplete)}%
          </Text>
        </View>
      </View>

      <View style={styles.targetRow}>
        <Text style={styles.targetText}>
          Daily Target: {entry.target.toFixed(2)} cups
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  date: {
    ...Theme.text.subtitle,
    color: Colors.primary.dark,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  amount: {
    ...Theme.text.title,
    color: Colors.accent.dark,
  },
  unit: {
    ...Theme.text.caption,
    marginLeft: 2,
    marginBottom: 2,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: Theme.spacing.sm,
  },
  cupIndicators: {
    flexDirection: "row",
  },
  smallCup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary.light,
    marginRight: 4,
  },
  percentContainer: {
    minWidth: 50,
    alignItems: "flex-end",
  },
  percent: {
    ...Theme.text.body,
    color: Colors.text.secondary,
  },
  complete: {
    color: Colors.success.main,
    fontWeight: "600",
  },
  targetRow: {
    marginTop: Theme.spacing.xs,
  },
  targetText: {
    ...Theme.text.caption,
    color: Colors.text.secondary,
  },
});

export default HistoryCard;
