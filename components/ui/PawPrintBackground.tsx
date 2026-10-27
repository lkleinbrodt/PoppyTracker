import { StyleSheet, View } from "react-native";

import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

type PawPrintProps = {
  color?: string;
  size?: number;
  style?: object;
};

const PawPrint: React.FC<PawPrintProps> = ({
  color = Colors.primary.light,
  size = 40,
  style = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons
        name="paw"
        size={size}
        color={color}
        style={{ opacity: 0.7 }}
      />
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
    position: "absolute",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    backgroundColor: Colors.background.default,
  },
  pawTopLeft: {
    top: "10%",
    left: "5%",
    transform: [{ rotate: "25deg" }],
  },
  pawTopRight: {
    top: "15%",
    right: "10%",
    transform: [{ rotate: "-15deg" }],
  },
  pawBottomLeft: {
    bottom: "20%",
    left: "15%",
    transform: [{ rotate: "-30deg" }],
  },
  pawBottomRight: {
    bottom: "10%",
    right: "5%",
    transform: [{ rotate: "15deg" }],
  },
  pawCenter: {
    top: "50%",
    left: "45%",
    transform: [{ rotate: "45deg" }],
  },
});

export default PawPrintBackground;
