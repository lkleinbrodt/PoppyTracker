import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import Theme from '@/constants/Theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'small' | 'medium' | 'large';
};

const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  elevation = 'medium' 
}) => {
  // Get elevation style
  const getElevationStyle = () => {
    switch (elevation) {
      case 'small':
        return Theme.shadows.small;
      case 'medium':
        return Theme.shadows.medium;
      case 'large':
        return Theme.shadows.large;
      default:
        return Theme.shadows.medium;
    }
  };

  return (
    <View style={[
      styles.card,
      getElevationStyle(),
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.paper,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
  },
});

export default Card;