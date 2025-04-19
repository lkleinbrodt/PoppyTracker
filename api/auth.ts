import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";

import { Platform } from "react-native";
import { apiClient } from "@/api/client";

// Types
export interface AppleCredentials {
  identityToken: string;
  nonce?: string;
  user: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
  email?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  speakingLevel?: string;
  totalRecordings: number;
  totalPracticeTime: number;
  lastPractice?: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize Apple Sign In
   * This should be called when the app starts to check if Apple Sign In is available
   */
  async initializeAppleAuth(): Promise<boolean> {
    if (Platform.OS !== "ios") return false;

    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      return isAvailable;
    } catch (error) {
      console.error("Apple Auth initialization failed:", error);
      return false;
    }
  }

  /**
   * Sign in with Apple
   * Handles the complete Apple Sign In flow
   */
  async signInWithApple(): Promise<AuthResponse> {
    try {
      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Log the credential for debugging
      console.log("Apple Sign In Credential:", {
        user: credential.user,
        identityToken: credential.identityToken,
        email: credential.email,
        fullName: credential.fullName,
      });

      // Send credentials to our backend
      const response = await apiClient.post<{
        access_token: string;
        refresh_token: string;
      }>("/poppy/auth/apple/signin", {
        identityToken: credential.identityToken,
        user: credential.user,
        fullName: credential.fullName,
        email: credential.email,
      });

      // Log the response for debugging
      console.log("Backend Sign In Response:", {
        ok: response.ok,
        error: response.error,
      });

      if (!response.ok || !response.data) {
        throw new Error(response.error?.message || "Sign in failed");
      }

      return response.data;
    } catch (error) {
      console.error("Apple Sign In failed:", error);
      throw error;
    }
  }

  /**
   * Get the current user's profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>("/poppy/me");

    if (!response.ok || !response.data) {
      throw new Error(response.error?.message || "Failed to get user profile");
    }

    return response.data;
  }

  /**
   * Delete the user's speech profile
   */
  async deleteSpeechProfile(): Promise<void> {
    const response = await apiClient.delete("/poppy/me");
    if (!response.ok) {
      throw new Error(
        response.error?.message || "Failed to delete speech profile"
      );
    }
  }
}

export const authService = AuthService.getInstance();
