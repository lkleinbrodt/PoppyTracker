import { Bone, History } from "lucide-react-native";
import { Redirect, Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { useAuth } from "@/auth/AuthContext";

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/welcome" />;
  }

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
