import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, View } from "react-native";

import Colors from "@/constants/Colors";
import React from "react";
import Theme from "@/constants/Theme";

type CupIconProps = {
  fillPercentage: number;
  isComplete: boolean;
  isOverTarget?: boolean;
  size?: number;
};

const CupIcon: React.FC<CupIconProps> = ({
  fillPercentage,
  isComplete,
  isOverTarget = false,
  size = 40,
}) => {
  // Animated value for the fill height
  const fillHeight = useSharedValue(0);

  // Update fill height when fillPercentage changes
  useAnimatedReaction(
    () => fillPercentage,
    (currentPercentage) => {
      fillHeight.value = withTiming(currentPercentage / 100, { duration: 500 });
    },
    [fillPercentage]
  );

  // Animated style for the fill
  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      height: `${fillHeight.value * 100}%`,
      backgroundColor: isOverTarget
        ? Colors.error.main
        : isComplete
        ? Colors.success.main
        : Colors.secondary.main,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {/* Cup outline */}
      <View
        style={[
          styles.cup,
          {
            borderColor: isOverTarget ? Colors.error.main : Colors.primary.main,
          },
        ]}
      >
        {/* Cup handle */}
        <View
          style={[
            styles.handle,
            {
              borderColor: isOverTarget
                ? Colors.error.main
                : Colors.primary.main,
            },
          ]}
        />

        {/* Animated fill */}
        <Animated.View style={[styles.fill, animatedFillStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.spacing.xs,
  },
  cup: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  handle: {
    position: "absolute",
    right: 0,
    top: "30%",
    width: "20%",
    height: "40%",
    borderWidth: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  fill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
});

export default CupIcon;
