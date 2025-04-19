import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import Colors from '@/constants/Colors';

type PawPrintProps = {
  color?: string;
  size?: number;
  style?: object;
};

const PawPrint: React.FC<PawPrintProps> = ({ 
  color = Colors.primary.light, 
  size = 40,
  style = {}
}) => {
  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8.5 13.5C9.32843 13.5 10 12.3284 10 10.5C10 8.67157 9.32843 7.5 8.5 7.5C7.67157 7.5 7 8.67157 7 10.5C7 12.3284 7.67157 13.5 8.5 13.5Z"
          fill={color}
          opacity={0.7}
        />
        <Path
          d="M15.5 13.5C16.3284 13.5 17 12.3284 17 10.5C17 8.67157 16.3284 7.5 15.5 7.5C14.6716 7.5 14 8.67157 14 10.5C14 12.3284 14.6716 13.5 15.5 13.5Z"
          fill={color}
          opacity={0.7}
        />
        <Path
          d="M6.5 9C7.32843 9 8 8.10457 8 7C8 5.89543 7.32843 5 6.5 5C5.67157 5 5 5.89543 5 7C5 8.10457 5.67157 9 6.5 9Z"
          fill={color}
          opacity={0.7}
        />
        <Path
          d="M17.5 9C18.3284 9 19 8.10457 19 7C19 5.89543 18.3284 5 17.5 5C16.6716 5 16 5.89543 16 7C16 8.10457 16.6716 9 17.5 9Z"
          fill={color}
          opacity={0.7}
        />
        <Path
          d="M12 19C14.7614 19 17 16.9853 17 14.5C17 12.0147 14.7614 10 12 10C9.23858 10 7 12.0147 7 14.5C7 16.9853 9.23858 19 12 19Z"
          fill={color}
          opacity={0.7}
        />
      </Svg>
    </View>
  );
};

const PawPrintBackground: React.FC = () => {
  return (
    <View style={styles.background}>
      <PawPrint style={styles.pawTopLeft} size={60} />
      <PawPrint style={styles.pawTopRight} size={45} />
      <PawPrint style={styles.pawBottomLeft} size={50} />
      <PawPrint style={styles.pawBottomRight} size={70} />
      <PawPrint style={styles.pawCenter} size={40} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  pawTopLeft: {
    top: '10%',
    left: '5%',
    transform: [{ rotate: '25deg' }],
  },
  pawTopRight: {
    top: '15%',
    right: '10%',
    transform: [{ rotate: '-15deg' }],
  },
  pawBottomLeft: {
    bottom: '20%',
    left: '15%',
    transform: [{ rotate: '-30deg' }],
  },
  pawBottomRight: {
    bottom: '10%',
    right: '5%',
    transform: [{ rotate: '15deg' }],
  },
  pawCenter: {
    top: '50%',
    left: '45%',
    transform: [{ rotate: '45deg' }],
  },
});

export default PawPrintBackground;