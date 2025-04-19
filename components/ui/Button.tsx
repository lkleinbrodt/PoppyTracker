import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import Theme from '@/constants/Theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outlined';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  size = 'medium',
}) => {
  // Animation value
  const scale = useSharedValue(1);

  // Handle button press
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Animate button
    scale.value = withTiming(0.95, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 150 });
    });
    
    onPress();
  };

  // Get button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outlined':
        return styles.outlinedButton;
      default:
        return styles.primaryButton;
    }
  };

  // Get text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outlined':
        return styles.outlinedText;
      default:
        return styles.primaryText;
    }
  };

  // Get button size style
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[
      animatedStyle,
      fullWidth && styles.fullWidth,
    ]}>
      <TouchableOpacity
        style={[
          styles.button,
          getButtonStyle(),
          getSizeStyle(),
          (disabled || loading) && styles.disabledButton,
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outlined' ? Colors.primary.main : 'white'}
            size="small"
          />
        ) : (
          <Text style={[
            styles.text,
            getTextStyle(),
            (disabled || loading) && styles.disabledText,
          ]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
    ...Theme.shadows.small,
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.accent.main,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary.main,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  smallButton: {
    height: 36,
    paddingHorizontal: Theme.spacing.md,
  },
  mediumButton: {
    height: 48,
    paddingHorizontal: Theme.spacing.lg,
  },
  largeButton: {
    height: 56,
    paddingHorizontal: Theme.spacing.xl,
  },
  disabledButton: {
    backgroundColor: Colors.background.paper,
    borderColor: Colors.text.disabled,
    opacity: 0.7,
  },
  text: {
    ...Theme.text.button,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlinedText: {
    color: Colors.primary.main,
  },
  disabledText: {
    color: Colors.text.disabled,
  },
});

export default Button;