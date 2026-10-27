import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (notification: {
    type: "time" | "feeding_reminder";
    title: string;
    body: string;
    time: string;
    threshold?: number;
    id?: string;
  }) => void;
  initialNotification?: {
    id?: string;
    type: "time" | "feeding_reminder";
    title: string;
    body: string;
    time: string;
    threshold?: number;
  };
}

export default function NotificationModal({
  visible,
  onClose,
  onSave,
  initialNotification,
}: NotificationModalProps) {
  const [notification, setNotification] = React.useState<{
    type: "time" | "feeding_reminder";
    title: string;
    body: string;
    time: string;
    threshold: number;
    id?: string;
  }>(() => {
    if (initialNotification) {
      return {
        ...initialNotification,
        threshold: initialNotification.threshold || 80,
      };
    }
    return {
      type: "time",
      title: "",
      body: "",
      time: "12:00",
      threshold: 80,
    };
  });

  // Initialize selectedTime based on initialNotification if present
  const [selectedTime, setSelectedTime] = React.useState(() => {
    if (initialNotification?.time) {
      const [hours, minutes] = initialNotification.time.split(":").map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date;
    }
    return new Date();
  });

  // Reset form when initialNotification changes
  React.useEffect(() => {
    if (initialNotification) {
      setNotification({
        ...initialNotification,
        threshold: initialNotification.threshold || 80,
      });
      const [hours, minutes] = initialNotification.time.split(":").map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      setSelectedTime(date);
    }
  }, [initialNotification]);

  const [showTimePicker, setShowTimePicker] = React.useState(false);

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
      const timeString = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      setNotification({ ...notification, time: timeString });
    }
  };

  const handleSave = () => {
    if (!notification.title || !notification.body) {
      return; // Don't save if required fields are empty
    }

    // Only include threshold if it's a feeding reminder
    const saveData =
      notification.type === "feeding_reminder"
        ? notification
        : { ...notification, threshold: undefined };

    onSave(saveData);

    // Reset form
    setNotification({
      type: "time",
      title: "",
      body: "",
      time: "12:00",
      threshold: 80,
    });
    setSelectedTime(new Date());
  };

  const handleClose = () => {
    // Reset form and close
    setNotification({
      type: "time",
      title: "",
      body: "",
      time: "12:00",
      threshold: 80,
    });
    setSelectedTime(new Date());
    onClose();
  };

  const toggleNotificationType = () => {
    setNotification({
      ...notification,
      type: notification.type === "time" ? "feeding_reminder" : "time",
      // Set a default body template for feeding reminders
      body:
        notification.type === "time"
          ? "Poppy has only eaten {amount}g out of {target}g ({percentage}% of daily goal)"
          : "",
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {initialNotification ? "Edit Reminder" : "Add New Reminder"}
          </Text>

          <View style={styles.switchContainer}>
            <Text>Feeding Reminder</Text>
            <Switch
              value={notification.type === "feeding_reminder"}
              onValueChange={toggleNotificationType}
              trackColor={{ false: "#767577", true: Colors.primary.main }}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Reminder Title"
            value={notification.title}
            onChangeText={(text) =>
              setNotification({ ...notification, title: text })
            }
          />

          <TextInput
            style={[styles.input, styles.bodyInput]}
            placeholder={
              notification.type === "feeding_reminder"
                ? "Use {amount}, {target}, and {percentage} as placeholders"
                : "Reminder Message"
            }
            value={notification.body}
            onChangeText={(text) =>
              setNotification({ ...notification, body: text })
            }
            multiline
          />

          {notification.type === "feeding_reminder" && (
            <View style={styles.thresholdContainer}>
              <Text>Threshold (%)</Text>
              <TextInput
                style={styles.thresholdInput}
                keyboardType="numeric"
                value={notification.threshold.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setNotification({
                    ...notification,
                    threshold: Math.min(100, Math.max(0, value)),
                  });
                }}
              />
            </View>
          )}

          <DateTimePicker
            style={styles.timePicker}
            value={selectedTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  bodyInput: {
    minHeight: 80,
  },
  thresholdContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  thresholdInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    width: 80,
    textAlign: "center",
    fontSize: 16,
  },
  timePicker: {
    marginBottom: 20,
    alignSelf: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#E5E5E5",
  },
  saveButton: {
    backgroundColor: Colors.primary.main,
  },
  cancelButtonText: {
    color: "#000",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
});
