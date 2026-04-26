import AsyncStorage from "@react-native-async-storage/async-storage";

export const SUPABASE_AUTH_STORAGE_KEY = "echotes.auth.session";

export const sessionStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export const clearPersistedSession = () =>
  sessionStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
