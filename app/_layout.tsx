import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { Slot, useRouter } from "expo-router";

import { FeedingProvider } from "@/context/FeedingContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useLoadFonts } from "@/hooks/useLoadFonts";

export default function RootLayout() {
  const isFrameworkReady = useFrameworkReady();
  const { fontsLoaded, fontError } = useLoadFonts();

  // Return null if fonts are not loaded yet
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FeedingProvider>
          <Slot />
        </FeedingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
