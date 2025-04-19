import { Bone, History } from "lucide-react-native";

import Colors from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background.default,
      }}
      edges={["top"]}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary.main,
          tabBarInactiveTintColor: Colors.text.disabled,
          tabBarStyle: {
            backgroundColor: Colors.background.paper,
            borderTopColor: "rgba(0, 0, 0, 0.1)",
          },
          tabBarLabelStyle: {
            fontFamily: "Nunito-Regular",
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ color, size }) => <Bone color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <History color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
