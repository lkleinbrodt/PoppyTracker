import { StyleSheet, Text, View } from "react-native";

import Card from "./Card";
import { ClockIcon } from "lucide-react-native";
import Colors from "@/constants/Colors";
import { FeedingEntry } from "@/api/feeding-records";
import React from "react";
import Theme from "@/constants/Theme";
import { groupFeedingsByNMinutes } from "@/utils/feedingUtils";

type FeedingHistoryCardProps = {
  feedings: FeedingEntry[];
};

const FeedingHistoryCard: React.FC<FeedingHistoryCardProps> = ({
  feedings,
}) => {
  // Group feedings by time chunks - the function handles UTC to local conversion
  const groupedFeedings = groupFeedingsByNMinutes(feedings);

  if (feedings.length === 0) {
    return (
      <Card>
        <View style={styles.headerRow}>
          <ClockIcon size={20} color={Colors.primary.main} />
          <Text style={styles.title}>Today's Feedings</Text>
        </View>
        <Text style={styles.emptyText}>No feedings recorded yet today.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.headerRow}>
        <ClockIcon size={20} color={Colors.primary.main} />
        <Text style={styles.title}>Today's Feedings</Text>
      </View>

      {groupedFeedings.map((group, index) => (
        <View key={group.timestamp} style={styles.historyItem}>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{group.timeChunk}</Text>
            <Text
              style={[
                styles.amountText,
                group.totalAmount < 0 ? styles.negativeAmount : null,
              ]}
            >
              {group.totalAmount > 0 ? "+" : ""}
              {group.totalAmount.toFixed(2)} cups
            </Text>
          </View>

          {/* <View style={styles.feedingDetails}>
            <Text style={styles.feedingCount}>
              {group.feedings.length} feeding
              {group.feedings.length !== 1 ? "s" : ""}
            </Text>
          </View> */}

          {index < groupedFeedings.length - 1 && (
            <View style={styles.divider} />
          )}
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.text.subtitle,
    color: Colors.primary.dark,
    marginLeft: Theme.spacing.sm,
  },
  emptyText: {
    ...Theme.text.body,
    color: Colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  historyItem: {
    marginBottom: Theme.spacing.sm,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.xs,
  },
  timeText: {
    ...Theme.text.body,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  amountText: {
    ...Theme.text.body,
    fontWeight: "bold",
    color: Colors.primary.main,
  },
  negativeAmount: {
    color: Colors.error.main,
  },
  feedingDetails: {
    marginBottom: Theme.spacing.xs,
  },
  feedingCount: {
    ...Theme.text.caption,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.paper,
    marginVertical: Theme.spacing.sm,
  },
});

export default FeedingHistoryCard;
