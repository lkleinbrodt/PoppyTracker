import * as SecureStore from "expo-secure-store";

import { ApiResponse, ApisauceInstance, create } from "apisauce";

import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { getApiConfig } from "@/config";
import { load } from "@/utils/secureStorage";

// Types
export interface APIResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// API Configuration

class APIClient {
  private static instance: APIClient;
  private api;
  private networkRetryCount = 3;
  private networkRetryDelay = 1000; // 1 second
  private baseURL: string;

  private constructor() {
    const config = getApiConfig();

    this.api = create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
      },
    });

    this.setupInterceptors();
    this.baseURL = config.baseURL;
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private getUserAgent(): string {
    const appVersion = Constants.expoConfig?.version || "1.0.0";
    return `SpeechCoach/${appVersion} (${Platform.OS}; ${Platform.Version})`;
  }

  private async setupInterceptors() {
    // Request interceptor
    this.api.addRequestTransform(async (request: any) => {
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        throw new Error("No internet connection");
      }

      // Add auth token if available
      const token = await load("authToken");
      if (token) {
        request.headers["Authorization"] = `Bearer ${token}`;
      }

      // Add device info
      request.headers["X-Device-Platform"] = Platform.OS;
      request.headers["X-Device-Version"] = Platform.Version.toString();

      return request;
    });

    // Response interceptor
    this.api.addResponseTransform((response: ApiResponse<any>) => {
      if (!response.ok) {
        console.log("Error API Response:", {
          url: response.config?.url,
          status: response.status,
          problem: response.problem,
          data: response.data,
        });
        const error: APIError = {
          code: response.problem || "UNKNOWN_ERROR",
          message: response.data?.message || "An unexpected error occurred",
          details: response.data,
        };
        throw error;
      }
      return response;
    });
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount: number = this.networkRetryCount
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount === 0 || !this.isRetryableError(error)) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          this.networkRetryDelay * (this.networkRetryCount - retryCount + 1)
        )
      );

      return this.retryWithBackoff(operation, retryCount - 1);
    }
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = ["TIMEOUT", "CONNECTION_ERROR", "NETWORK_ERROR"];
    return retryableCodes.includes(error.code);
  }

  private async getHeaders(): Promise<Headers> {
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    // Add auth token if available
    const token = await load("authToken");
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  // Generic request methods with type safety
  async get<T>(path: string): Promise<APIResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "GET",
        headers,
      });
      const data = await response.json();
      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  async post<T>(path: string, body?: any): Promise<APIResponse<T>> {
    try {
      const headers = await this.getHeaders();

      // Don't set Content-Type for FormData, let the browser set it with the boundary
      if (!(body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`${this.baseURL}${path}`, {
        method: "POST",
        headers,
        body:
          body instanceof FormData
            ? body
            : body
            ? JSON.stringify(body)
            : undefined,
      });
      const data = await response.json();
      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  async put<T>(path: string, data?: object): Promise<APIResponse<T>> {
    return this.retryWithBackoff(async () => {
      const response = await this.api.put<T>(path, data);
      return {
        ok: response.ok,
        data: response.data,
        error: response.ok
          ? undefined
          : {
              code: response.problem || "UNKNOWN_ERROR",
              message:
                (response.data as any)?.message ||
                "An unexpected error occurred",
              details: response.data,
            },
      };
    });
  }

  async delete<T>(path: string): Promise<APIResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "DELETE",
        headers,
      });
      const data = await response.json();
      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }
}

export const apiClient = APIClient.getInstance();
