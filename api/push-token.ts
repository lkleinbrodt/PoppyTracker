import { apiClient } from "./client";

/**
 * Update the user's push notification token
 */
export const updatePushToken = async (token: string): Promise<boolean> => {
  const response = await apiClient.post("/poppy/settings/push-token", {
    token,
  });

  if (!response.ok) {
    console.error(
      "Failed to update push token:",
      response.error?.message || "Unknown error"
    );
    return false;
  }

  return true;
};
