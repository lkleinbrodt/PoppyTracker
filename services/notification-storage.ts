import {
  DEFAULT_NOTIFICATIONS,
  NotificationSchedule,
} from "./notification-schedules";

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "poppy_tracker_notification_schedules";

export class NotificationStorageService {
  private static instance: NotificationStorageService;

  private constructor() {}

  static getInstance(): NotificationStorageService {
    if (!NotificationStorageService.instance) {
      NotificationStorageService.instance = new NotificationStorageService();
    }
    return NotificationStorageService.instance;
  }

  async getSchedules(): Promise<NotificationSchedule[]> {
    try {
      const storedSchedules = await AsyncStorage.getItem(STORAGE_KEY);
      if (!storedSchedules) {
        // If no schedules are stored, save and return defaults
        await this.saveSchedules(DEFAULT_NOTIFICATIONS);
        return DEFAULT_NOTIFICATIONS;
      }
      return JSON.parse(storedSchedules);
    } catch (error) {
      console.error("Failed to load notification schedules:", error);
      return DEFAULT_NOTIFICATIONS;
    }
  }

  async saveSchedules(schedules: NotificationSchedule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    } catch (error) {
      console.error("Failed to save notification schedules:", error);
      throw error;
    }
  }

  async resetToDefaults(): Promise<NotificationSchedule[]> {
    try {
      await this.saveSchedules(DEFAULT_NOTIFICATIONS);
      return DEFAULT_NOTIFICATIONS;
    } catch (error) {
      console.error("Failed to reset notification schedules:", error);
      throw error;
    }
  }
}
