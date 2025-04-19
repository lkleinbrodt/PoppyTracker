import * as SecureStore from 'expo-secure-store';

export const save = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

export const load = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

export const remove = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key);
};
