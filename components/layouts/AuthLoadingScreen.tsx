import { SplashScreen } from "expo-router";
import { useAuth } from "@/auth/AuthContext";
import { useEffect } from "react";

export default function AuthLoadingScreen() {
  const { loading } = useAuth();

  // Hide splash screen once auth is ready
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // Return null to keep splash screen visible
  return null;
}
