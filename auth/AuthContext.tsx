import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, authService } from "../api/auth";
import { getUser, removeToken, storeToken } from "./storage";

import { Alert } from "react-native";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      const user = await getUser();
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error("Failed to restore user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Apple Sign In is available
      const isAvailable = await authService.initializeAppleAuth();
      if (!isAvailable) {
        throw new Error("Apple Sign In is not available on this device");
      }

      // Perform sign in
      const response = await authService.signInWithApple();
      const accessToken = response.access_token;
      const refreshToken = response.refresh_token;
      const user = jwtDecode(accessToken) as UserProfile;
      setUser(user);
      await storeToken(accessToken);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
      Alert.alert("Sign In Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      setUser(null);
      await removeToken();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      Alert.alert("Sign Out Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
