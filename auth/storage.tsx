import * as SecureStore from "expo-secure-store";

import { UserProfile } from "@/api/auth";
import { jwtDecode } from "jwt-decode";

export const save = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

export const load = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

export const remove = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key);
};

const storeToken = async (authToken: string) => {
  try {
    await save("authToken", authToken);
  } catch (error) {
    console.log("Error storing the auth token", error);
  }
};

const getToken = async () => {
  try {
    const token = await load("authToken");
    return token;
  } catch (error) {
    console.log("Error getting the auth token", error);
  }
};

const removeToken = async () => {
  try {
    await remove("authToken");
  } catch (error) {
    console.log("Error removing the auth token", error);
  }
};

const getUser = async (): Promise<UserProfile | null> => {
  try {
    const token = await getToken();
    if (!token) return null;
    const user = jwtDecode(token) as UserProfile;
    return user;
  } catch (error) {
    console.log("Error getting the user", error);
    return null;
  }
};

export { storeToken, getToken, removeToken, getUser };
