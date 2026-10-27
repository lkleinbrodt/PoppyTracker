export interface BaseNotificationSchedule {
  id: string;
  time: string; // HH:mm format
  title: string;
  body: string;
}

export interface TimeBasedNotification extends BaseNotificationSchedule {
  type: "time";
}

export interface FeedingReminderNotification extends BaseNotificationSchedule {
  type: "feeding_reminder";
  threshold: number; // Percentage of daily target (0-100)
}

export type NotificationSchedule =
  | TimeBasedNotification
  | FeedingReminderNotification;

export const DEFAULT_NOTIFICATIONS: NotificationSchedule[] = [
  {
    id: "lunch",
    type: "feeding_reminder",
    time: "12:00",
    title: "Lunch Time",
    body: "Don't forget Poppy's lunch!",
    threshold: 50,
  },
  {
    id: "dinner",
    type: "feeding_reminder",
    time: "18:00",
    title: "Dinner Time",
    body: "Don't forget Poppy's dinner!",
    threshold: 100,
  },
  {
    id: "bedtime",
    type: "time",
    time: "21:00",
    title: "Time for bed",
    body: "Is Poppy ready for bed?",
  },
];
