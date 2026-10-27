import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { getApiConfig } from "@/api/config";
import { getToken } from "@/auth/storage";

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

class APIClient {
  private static instance: APIClient;
  private axiosInstance: AxiosInstance;
  private networkRetryCount = 3;
  private networkRetryDelay = 1000; // 1 second
  private debugMode = true;

  private constructor() {
    const config = getApiConfig();

    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  private logRequest(method: string, path: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[API Request] ${method} ${path}`, data ? { data } : "");
    }
  }

  private logResponse(method: string, path: string, response: any): void {
    if (this.debugMode) {
      console.log(`[API Response] ${method} ${path}`, response);
    }
  }

  private getUserAgent(): string {
    const appVersion = Constants.expoConfig?.version || "1.0.0";
    return `SpeechCoach/${appVersion} (${Platform.OS}; ${Platform.Version})`;
  }

  private async setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(async (config) => {
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        throw new Error("No internet connection");
      }

      // Add auth token if available
      const token = await getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      // Add device info
      config.headers["X-Device-Platform"] = Platform.OS;
      config.headers["X-Device-Version"] = Platform.Version.toString();

      return config;
    });

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const errorInfo = {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          problem: this.getProblemCode(error),
          data: error.response?.data,
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString(),
          requestData: error.config?.data,
        };

        console.log("Error API Response:", {
          endpoint: `${errorInfo.method} ${errorInfo.url}`,
          status: errorInfo.status,
          statusText: errorInfo.statusText,
          problem: errorInfo.problem,
          message: errorInfo.message,
          data: errorInfo.data,
          timestamp: errorInfo.timestamp,
        });

        const apiError: APIError = {
          code: this.getProblemCode(error),
          message: this.getErrorMessage(error),
          details: {
            errorInfo,
            responseData: error.response?.data as Record<string, unknown>,
          },
        };
        throw apiError;
      }
    );
  }

  private getProblemCode(error: AxiosError): string {
    if (error.code === "ECONNABORTED") return "TIMEOUT";
    if (!error.response) return "NETWORK_ERROR";
    if (error.response.status === 401) return "UNAUTHORIZED";
    if (error.response.status === 403) return "FORBIDDEN";
    if (error.response.status === 404) return "NOT_FOUND";
    if (error.response.status >= 500) return "SERVER_ERROR";
    if (error.response.status >= 400) return "CLIENT_ERROR";
    return "UNKNOWN_ERROR";
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.code === "ECONNABORTED") return "Request timed out";
    if (!error.response) return "Network connection failed";

    return (
      (error.response?.data as any)?.message ||
      error.message ||
      `Server returned ${error.response.status} ${error.response.statusText}`
    );
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = ["TIMEOUT", "NETWORK_ERROR", "SERVER_ERROR"];
    return retryableCodes.includes(this.getProblemCode(error));
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

  private formatResponse<T>(response: AxiosResponse<T>): APIResponse<T> {
    return {
      ok: response.status >= 200 && response.status < 300,
      data: response.data,
      error: undefined,
    };
  }

  // Generic request methods with type safety
  async get<T>(path: string): Promise<APIResponse<T>> {
    try {
      this.logRequest("GET", path);
      const response = await this.retryWithBackoff(() =>
        this.axiosInstance.get<T>(path)
      );
      const result = this.formatResponse(response);
      this.logResponse("GET", path, result);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
          code: (error as APIError).code,
          details: (error as APIError).details,
        },
      };
    }
  }

  async post<T>(path: string, body?: any): Promise<APIResponse<T>> {
    try {
      this.logRequest("POST", path, body);
      const response = await this.retryWithBackoff(() =>
        this.axiosInstance.post<T>(path, body)
      );
      const result = this.formatResponse(response);
      this.logResponse("POST", path, result);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
          code: (error as APIError).code,
          details: (error as APIError).details,
        },
      };
    }
  }

  async put<T>(path: string, data?: any): Promise<APIResponse<T>> {
    try {
      this.logRequest("PUT", path, data);
      const response = await this.retryWithBackoff(() =>
        this.axiosInstance.put<T>(path, data)
      );
      const result = this.formatResponse(response);
      this.logResponse("PUT", path, result);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
          code: (error as APIError).code,
          details: (error as APIError).details,
        },
      };
    }
  }

  async delete<T>(path: string): Promise<APIResponse<T>> {
    try {
      this.logRequest("DELETE", path);
      const response = await this.retryWithBackoff(() =>
        this.axiosInstance.delete<T>(path)
      );
      const result = this.formatResponse(response);
      this.logResponse("DELETE", path, result);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
          code: (error as APIError).code,
          details: (error as APIError).details,
        },
      };
    }
  }
}

export const apiClient = APIClient.getInstance();
