import Colors from "./Colors";
import { Platform } from "react-native";

export default {
  // Typography
  text: {
    title: {
      fontFamily: "Nunito-Bold",
      fontSize: 24,
      fontWeight: "700" as const,
      color: Colors.text.primary,
      lineHeight: 32,
    },
    subtitle: {
      fontFamily: "Nunito-SemiBold",
      fontSize: 18,
      fontWeight: "600" as const,
      color: Colors.text.primary,
      lineHeight: 24,
    },
    body: {
      fontFamily: "Nunito-Regular",
      fontSize: 16,
      fontWeight: "400" as const,
      color: Colors.text.primary,
      lineHeight: 24,
    },
    caption: {
      fontFamily: "Nunito-Regular",
      fontSize: 14,
      fontWeight: "400" as const,
      color: Colors.text.secondary,
      lineHeight: 20,
    },
    button: {
      fontFamily: "Nunito-Bold",
      fontSize: 16,
      fontWeight: "700" as const,
      color: Colors.text.primary,
      lineHeight: 24,
    },
  },

  // Spacing - follows 8px grid
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Shadows for iOS
  shadows: Platform.select({
    ios: {
      small: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      medium: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
      },
      large: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
    },
    default: {},
  }),

  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
};
