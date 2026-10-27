import { Slot, Stack, useRouter } from "expo-router";

import AppLoadingScreen from "@/components/layouts/AppLoadingScreen";
import { AuthProvider } from "@/auth/AuthContext";
import { FeedingProvider } from "@/context/FeedingContext";
import { NotificationService } from "@/services/notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Initialize notifications
    const notificationService = NotificationService.getInstance();

    // Subscribe to notification state changes
    const unsubscribe = notificationService.subscribe((state) => {
      if (state.notification) {
        console.log(
          "Received notification:",
          state.notification.request.content
        );
      }
      if (state.response) {
        console.log("Notification response:", state.response);
        // Handle notification response (e.g., navigate to a specific screen)
      }
    });

    // Initialize and get push token
    notificationService.initialize().then((token) => {
      if (token) {
        console.log("Token:", token);
        // Send the token to the backend
        // updatePushToken(token).then((success) => {
        //   if (success) {
        //     console.log("Successfully registered push token with backend");
        //   } else {
        //     console.log("Failed to register push token with backend");
        //   }
        // });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

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
