import { SplashScreen } from "expo-router";
import { useAuth } from "@/auth/AuthContext";
import { useEffect } from "react";
import { useLoadFonts } from "@/hooks/useLoadFonts";

export default function AppLoadingScreen() {
  const { loading: authLoading } = useAuth();
  const { fontsLoaded, fontError } = useLoadFonts();

  useEffect(() => {
    if (fontsLoaded && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  return null;
}
