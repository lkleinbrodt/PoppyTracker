import * as Notifications from "expo-notifications";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  DEFAULT_NOTIFICATIONS,
  FeedingReminderNotification,
  NotificationSchedule,
} from "@/services/notification-schedules";
import React, { useEffect, useState } from "react";

import Colors from "@/constants/Colors";
import Header from "@/components/layouts/Header";
import { Ionicons } from "@expo/vector-icons";
import NotificationModal from "@/components/AddReminderModal";
import { NotificationService } from "@/services/notifications";
import { NotificationStorageService } from "@/services/notification-storage";
import PawPrintBackground from "@/components/ui/PawPrintBackground";
import { router } from "expo-router";

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<
    NotificationSchedule | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const storageService = NotificationStorageService.getInstance();
      const notificationService = NotificationService.getInstance();

      // Load saved schedules
      const savedSchedules = await storageService.getSchedules();
      setSchedules(savedSchedules);

      // Schedule notifications - the service will now check if each one is already scheduled
      for (const schedule of savedSchedules) {
        await notificationService.scheduleNotification(schedule);
      }
    } catch (error) {
      console.error("Failed to load schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotification = async (notification: {
    type: "time" | "feeding_reminder";
    title: string;
    body: string;
    time: string;
    threshold?: number;
    id?: string;
  }) => {
    try {
      let updatedSchedules: NotificationSchedule[];
      const notificationService = NotificationService.getInstance();

      if (notification.id) {
        // Update existing notification - first cancel the old one
        await Notifications.cancelScheduledNotificationAsync(notification.id);

        // Update in schedules array
        updatedSchedules = schedules.map((s) =>
          s.id === notification.id
            ? ({ ...notification, id: s.id } as NotificationSchedule)
            : s
        );
      } else {
        // Add new notification
        const newSchedule: NotificationSchedule = {
          id: Date.now().toString(),
          ...notification,
        } as NotificationSchedule;
        updatedSchedules = [...schedules, newSchedule];
      }

      // Save to storage
      const storageService = NotificationStorageService.getInstance();
      await storageService.saveSchedules(updatedSchedules);
      setSchedules(updatedSchedules);

      // Schedule only the new/updated notification
      const scheduleToUpdate = updatedSchedules.find(
        (s) =>
          s.id ===
          (notification.id || updatedSchedules[updatedSchedules.length - 1].id)
      );
      if (scheduleToUpdate) {
        await notificationService.scheduleNotification(scheduleToUpdate);
      }

      setShowNotificationModal(false);
      setSelectedNotification(undefined);
    } catch (error) {
      console.error("Failed to save notification:", error);
    }
  };

  const handleCloseModal = () => {
    setShowNotificationModal(false);
    setSelectedNotification(undefined);
  };

  const handleEditNotification = (schedule: NotificationSchedule) => {
    setSelectedNotification(schedule);
    setShowNotificationModal(true);
  };

  const deleteSchedule = async (id: string) => {
    try {
      const updatedSchedules = schedules.filter((s) => s.id !== id);

      // Save to storage
      const storageService = NotificationStorageService.getInstance();
      await storageService.saveSchedules(updatedSchedules);
      setSchedules(updatedSchedules);

      // Cancel only this specific notification
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const renderScheduleItem = (schedule: NotificationSchedule) => {
    const isFeedingReminder = "threshold" in schedule;

    return (
      <TouchableOpacity
        key={schedule.id}
        style={styles.scheduleItem}
        onPress={() => handleEditNotification(schedule)}
      >
        <View style={styles.scheduleInfo}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.scheduleTime}>{schedule.time}</Text>
            {isFeedingReminder && (
              <Text style={[styles.thresholdText, { marginLeft: 8 }]}>
                If fed less than:{" "}
                {(schedule as FeedingReminderNotification).threshold}%
              </Text>
            )}
          </View>
          <Text style={styles.scheduleTitle}>{schedule.title}</Text>
          <Text style={styles.scheduleBody}>{schedule.body}</Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteSchedule(schedule.id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PawPrintBackground />
      <Header title="Schedule" showDogImage={false} />
      <ScrollView style={styles.container}>
        {schedules.map(renderScheduleItem)}

        <NotificationModal
          visible={showNotificationModal}
          onClose={handleCloseModal}
          onSave={handleSaveNotification}
          initialNotification={selectedNotification}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNotificationModal(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Reminder</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary.main,
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  scheduleItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background.default,
    opacity: 0.9,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  scheduleTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  scheduleBody: {
    fontSize: 14,
    color: "#666",
  },
  scheduleActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  thresholdText: {
    fontSize: 14,
    color: Colors.primary.main,
    marginTop: 4,
  },
});
