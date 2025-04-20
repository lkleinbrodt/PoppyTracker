import * as Haptics from "expo-haptics";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Minus, Plus } from "lucide-react-native";

import Colors from "@/constants/Colors";
import { Platform } from "react-native";
import React from "react";
import Theme from "@/constants/Theme";

type CounterProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  loading?: boolean;
};

const Counter: React.FC<CounterProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.25,
  disabled = false,
  loading = false,
}) => {
  // Animation values
  const plusScale = useSharedValue(1);
  const minusScale = useSharedValue(1);
  const valueScale = useSharedValue(1);

  // Handle increment
  const handleIncrement = () => {
    if (disabled || value >= max || loading) return;

    // Apply haptic feedback on mobile platforms
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate button
    plusScale.value = withTiming(0.9, { duration: 100 }, () => {
      plusScale.value = withTiming(1, { duration: 100 });
    });

    // Animate value
    valueScale.value = withSpring(1.1, { damping: 10 }, () => {
      valueScale.value = withSpring(1);
    });

    // Update value
    const newValue = Math.min(max, parseFloat((value + step).toFixed(2)));
    onChange(newValue);
  };

  // Handle decrement
  const handleDecrement = () => {
    if (disabled || value <= min || loading) return;

    // Apply haptic feedback on mobile platforms
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate button
    minusScale.value = withTiming(0.9, { duration: 100 }, () => {
      minusScale.value = withTiming(1, { duration: 100 });
    });

    // Animate value
    valueScale.value = withSpring(0.9, { damping: 10 }, () => {
      valueScale.value = withSpring(1);
    });

    // Update value
    const newValue = Math.max(min, parseFloat((value - step).toFixed(2)));
    onChange(newValue);
  };

  // Animated styles
  const animatedPlusStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: plusScale.value }],
    };
  });

  const animatedMinusStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: minusScale.value }],
    };
  });

  const animatedValueStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: valueScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={animatedMinusStyle}>
        <TouchableOpacity
          style={[
            styles.button,
            value <= min && styles.buttonDisabled,
            disabled && styles.buttonDisabled,
            loading && styles.buttonLoading,
          ]}
          onPress={handleDecrement}
          disabled={disabled || value <= min || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text.primary} size="small" />
          ) : (
            <Minus
              size={24}
              color={
                value <= min || disabled
                  ? Colors.text.disabled
                  : Colors.text.primary
              }
              strokeWidth={3}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.valueContainer, animatedValueStyle]}>
        <Text style={styles.valueText}>{value.toFixed(2)}</Text>
        <Text style={styles.unitText}>cups</Text>
      </Animated.View>

      <Animated.View style={animatedPlusStyle}>
        <TouchableOpacity
          style={[
            styles.button,
            value >= max && styles.buttonDisabled,
            disabled && styles.buttonDisabled,
            loading && styles.buttonLoading,
          ]}
          onPress={handleIncrement}
          disabled={disabled || value >= max || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text.primary} size="small" />
          ) : (
            <Plus
              size={24}
              color={
                value >= max || disabled
                  ? Colors.text.disabled
                  : Colors.text.primary
              }
              strokeWidth={3}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Theme.spacing.md,
  },
  button: {
    width: 54,
    height: 54,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    ...Theme.shadows.medium,
  },
  buttonDisabled: {
    backgroundColor: Colors.background.paper,
    opacity: 0.7,
  },
  buttonLoading: {
    backgroundColor: Colors.primary.light,
    opacity: 0.7,
  },
  valueContainer: {
    marginHorizontal: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    ...Theme.text.title,
    fontSize: 28,
    color: Colors.primary.dark,
  },
  unitText: {
    ...Theme.text.caption,
    marginTop: -Theme.spacing.xs,
  },
});

export default Counter;
