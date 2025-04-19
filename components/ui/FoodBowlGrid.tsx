import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import Colors from "@/constants/Colors";
import Theme from "@/constants/Theme";

type FoodBowlGridProps = {
  cups: number;
  size?: number;
};

const AnimatedImage = Animated.createAnimatedComponent(Animated.Image);

const AnimatedBowl: React.FC<{
  size: number;
  visible: boolean;
}> = ({ size, visible }) => {
  const scale = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1, { mass: 0.5, damping: 8 }),
        withSpring(1.2, { damping: 5 }),
        withSpring(1)
      );
    } else {
      scale.value = withSpring(0, { mass: 0.5, damping: 8 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedImage
      source={require("@/assets/images/foodbowl.png")}
      style={[styles.bowl, { width: size, height: size }, animatedStyle]}
    />
  );
};

const FoodBowlGrid: React.FC<FoodBowlGridProps> = ({ cups, size = 28 }) => {
  const completeCups = Math.floor(cups);
  const remainingBowls = Math.round((cups % 1) * 4);

  const renderEmptyBowl = (key: string) => (
    <View key={key} style={[styles.emptyBowl, { width: size, height: size }]} />
  );

  const renderCup = (numBowls: number, cupIndex: number) => {
    const isFull = numBowls === 4;
    return (
      <View key={`cup-${cupIndex}`} style={styles.cupOuterContainer}>
        <View style={[styles.cupContainer, isFull && styles.fullCupContainer]}>
          <View style={styles.cupRow}>
            {numBowls > 0 ? (
              <AnimatedBowl key={`${cupIndex}-0`} size={size} visible={true} />
            ) : (
              renderEmptyBowl(`${cupIndex}-0`)
            )}
            {numBowls > 1 ? (
              <AnimatedBowl key={`${cupIndex}-1`} size={size} visible={true} />
            ) : (
              renderEmptyBowl(`${cupIndex}-1`)
            )}
          </View>
          <View style={styles.cupRow}>
            {numBowls > 2 ? (
              <AnimatedBowl key={`${cupIndex}-2`} size={size} visible={true} />
            ) : (
              renderEmptyBowl(`${cupIndex}-2`)
            )}
            {numBowls > 3 ? (
              <AnimatedBowl key={`${cupIndex}-3`} size={size} visible={true} />
            ) : (
              renderEmptyBowl(`${cupIndex}-3`)
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {[...Array(completeCups)].map((_, index) => renderCup(4, index))}
        {remainingBowls > 0 && renderCup(remainingBowls, completeCups)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    width: "100%",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.lg,
    justifyContent: "flex-start",
  },
  cupOuterContainer: {
    position: "relative",
  },
  cupContainer: {
    borderWidth: 2,
    borderColor: Colors.primary.main,
    borderRadius: Theme.spacing.xxs,
    padding: Theme.spacing.xxs,
    backgroundColor: Colors.background.paper,
    borderBottomLeftRadius: Theme.spacing.md,
    borderBottomRightRadius: Theme.spacing.md,
  },
  fullCupContainer: {
    borderColor: Colors.success.main,
    backgroundColor: Colors.success.light,
  },
  cupHandle: {
    position: "absolute",
    right: -Theme.spacing.md,
    top: "30%",
    width: Theme.spacing.md,
    height: "40%",
    borderWidth: 2,
    borderLeftWidth: 0,
    borderColor: Colors.primary.main,
    borderTopRightRadius: Theme.spacing.xs,
    borderBottomRightRadius: Theme.spacing.xs,
  },
  cupRow: {
    flexDirection: "row",
    gap: Theme.spacing.xxs,
  },
  bowl: {
    resizeMode: "contain",
  },
  emptyBowl: {
    // This creates a transparent placeholder for empty spots
  },
});

export default FoodBowlGrid;
