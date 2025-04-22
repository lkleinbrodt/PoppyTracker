import { Slot, useRouter } from "expo-router";

import AppLoadingScreen from "@/components/layouts/AppLoadingScreen";
import { AuthProvider } from "@/auth/AuthContext";
import { FeedingProvider } from "@/context/FeedingContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreen } from "expo-router";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FeedingProvider>
          <AppLoadingScreen />
          <Slot />
        </FeedingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
