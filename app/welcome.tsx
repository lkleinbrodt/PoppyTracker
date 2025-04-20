import * as AppleAuthentication from "expo-apple-authentication";

import { Image, Platform, StyleSheet, Text, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    try {
      await signIn();
      router.replace("/");
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <LinearGradient
        colors={["#FFF8E8", "#FFFCF5"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/poppy-cartoon-no-bg.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>PoppyTracker</Text>
        <Text style={styles.subtitle}>This dog eats!!!</Text>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleSignIn}
          />
        )}

        <View style={styles.footer}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E8",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4A3728",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },
  subtitle: {
    fontSize: 17,
    color: "#6B5A4E",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },
  appleButton: {
    width: "100%",
    height: 50,
    marginBottom: 16,
  },
  footer: {
    position: "absolute",
    bottom: 32 + (Platform.OS === "ios" ? 0 : 16), // Adjust for Android
    left: 24,
    right: 24,
  },
  footerText: {
    fontSize: 13,
    color: "#6B5A4E",
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: "#A67B5B",
    textDecorationLine: "underline",
  },
});
