import { StyleSheet, View } from "react-native";

import Colors from "@/constants/Colors";
import CupIcon from "./CupIcon";
import React from "react";
import Theme from "@/constants/Theme";

type FeedingProgressIndicatorProps = {
  amountFed: number;
  targetAmount: number;
  isOverTarget?: boolean;
};

const FeedingProgressIndicator: React.FC<FeedingProgressIndicatorProps> = ({
  amountFed,
  targetAmount,
  isOverTarget = false,
}) => {
  const cups = [];
  const totalCups = isOverTarget
    ? Math.ceil(amountFed)
    : Math.ceil(targetAmount);

  for (let i = 0; i < totalCups; i++) {
    // Calculate fill percentage for this cup
    let fillPercentage = 0;
    if (amountFed > i) {
      fillPercentage = amountFed >= i + 1 ? 100 : (amountFed - i) * 100;
    }

    cups.push(
      <CupIcon
        key={i}
        fillPercentage={fillPercentage}
        isComplete={fillPercentage === 100}
        size={50}
        isOverTarget={isOverTarget && i >= Math.floor(targetAmount)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>{cups}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingHorizontal: Theme.spacing.md,
  },
});

export default FeedingProgressIndicator;
