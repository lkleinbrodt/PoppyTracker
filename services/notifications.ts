import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import {
  FeedingReminderNotification,
  NotificationSchedule,
  TimeBasedNotification,
} from "./notification-schedules";

import Constants from "expo-constants";
import { NotificationStorageService } from "./notification-storage";
import { Platform } from "react-native";
import { useFeeding } from "@/context/FeedingContext";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationState {
  notification: Notifications.Notification | undefined;
  response: Notifications.NotificationResponse | undefined;
}

export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private stateChangeCallbacks: ((state: NotificationState) => void)[] = [];
  private state: NotificationState = {
    notification: undefined,
    response: undefined,
  };

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Subscribe to notification state changes
  subscribe(callback: (state: NotificationState) => void) {
    this.stateChangeCallbacks.push(callback);
    // Immediately call with current state
    callback(this.state);
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  private updateState(newState: Partial<NotificationState>) {
    this.state = { ...this.state, ...newState };
    this.stateChangeCallbacks.forEach((callback) => callback(this.state));
  }

  async initialize(): Promise<string | null> {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (!Device.isDevice) {
      console.log("Must use physical device for push notifications");
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = tokenData.data;

      // Set up notification listeners
      this.setupNotificationListeners();

      // Schedule feeding reminders
      await this.scheduleFeedingReminders();

      return this.pushToken;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  private setupNotificationListeners() {
    // Remove existing listeners if any
    this.cleanup();

    // Listen for received notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        await this.handleReceivedNotification(notification);
        this.updateState({ notification });
      }
    );

    // Listen for notification responses (when user taps a notification)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        this.updateState({ response: response });
        console.log("Notification response:", response);
      });
  }

  private cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  getPushToken(): string | null {
    return this.pushToken;
  }

  getCurrentState(): NotificationState {
    return this.state;
  }

  // Schedule all feeding reminders
  async scheduleFeedingReminders(): Promise<void> {
    // First, cancel any existing notifications
    await this.cancelAllScheduledNotifications();

    // Get saved schedules from storage
    const storageService = NotificationStorageService.getInstance();
    const schedules = await storageService.getSchedules();

    // Schedule each reminder
    for (const reminder of schedules) {
      await this.scheduleNotification(reminder);
    }
  }

  // Get all scheduled notifications
  async getAllScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Check if a notification is already scheduled
  private async isNotificationScheduled(
    schedule: NotificationSchedule
  ): Promise<boolean> {
    const scheduledNotifications = await this.getAllScheduledNotifications();
    return scheduledNotifications.some(
      (notification) => notification.content.data?.id === schedule.id
    );
  }

  // Schedule a single notification
  async scheduleNotification(schedule: NotificationSchedule): Promise<void> {
    // Check if notification is already scheduled
    const isScheduled = await this.isNotificationScheduled(schedule);
    if (isScheduled) {
      console.log(`Notification ${schedule.id} is already scheduled, skipping`);
      return;
    }

    if (schedule.type === "feeding_reminder") {
      await this.scheduleFeedingReminderNotification(schedule);
    } else {
      await this.scheduleTimeBasedNotification(schedule);
    }
  }

  // Schedule a time-based notification
  private async scheduleTimeBasedNotification(
    schedule: TimeBasedNotification
  ): Promise<void> {
    const [hours, minutes] = schedule.time.split(":").map(Number);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: schedule.title,
          body: schedule.body,
          data: { id: schedule.id, type: "time" },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
          type: "daily",
        } as Notifications.DailyTriggerInput,
      });
      console.log(`Scheduled time-based notification for ${schedule.time}`);
    } catch (error) {
      console.error(
        `Failed to schedule time-based notification for ${schedule.time}:`,
        error
      );
    }
  }

  // Schedule a feeding reminder notification
  private async scheduleFeedingReminderNotification(
    schedule: FeedingReminderNotification
  ): Promise<void> {
    const [hours, minutes] = schedule.time.split(":").map(Number);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: schedule.title,
          body: schedule.body,
          data: {
            id: schedule.id,
            type: "feeding_reminder",
            threshold: schedule.threshold,
          },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
          type: "daily",
        } as Notifications.DailyTriggerInput,
      });
      console.log(
        `Scheduled feeding reminder notification for ${schedule.time}`
      );
    } catch (error) {
      console.error(
        `Failed to schedule feeding reminder notification for ${schedule.time}:`,
        error
      );
    }
  }

  // Handle received notifications
  private async handleReceivedNotification(
    notification: Notifications.Notification
  ) {
    const data = notification.request.content.data as
      | { type: string; threshold: number }
      | undefined;

    if (data?.type === "feeding_reminder") {
      const feedingContext = useFeeding();
      const { todayData } = feedingContext.state;

      if (!todayData) return; // No data available

      const percentageFed = (todayData.amountFed / todayData.target) * 100;
      const body = notification.request.content.body || "";

      // Only send notification if below threshold
      if (percentageFed < data.threshold) {
        const formattedBody = body
          .replace("{amount}", todayData.amountFed.toString())
          .replace("{target}", todayData.target.toString())
          .replace("{percentage}", percentageFed.toFixed(1));

        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.request.content.title || "Feeding Reminder",
            body: formattedBody,
          },
          trigger: null, // Send immediately
        });
      }
    }
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Cancelled all scheduled notifications");
  }
}
