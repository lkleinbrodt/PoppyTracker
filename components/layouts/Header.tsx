import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import React from "react";
import Theme from "@/constants/Theme";
import { useAuth } from "@/auth/AuthContext";

type HeaderProps = {
  title: string;
  subtitle?: string;
  showDogImage?: boolean;
};

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showDogImage = true,
}) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: signOut,
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {/* {user ? (
          <Text style={styles.user}>{user.email}</Text>
        ) : (
          <Text style={styles.user}>No user</Text>
        )} */}
      </View>

      <View style={styles.rightContainer}>
        {showDogImage && user && (
          <TouchableOpacity onPress={handleSignOut}>
            <Image
              source={require("../../assets/images/poppy.jpeg")}
              style={styles.image}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.background.default,
  },
  textContainer: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  title: {
    ...Theme.text.title,
    fontSize: 28,
    color: Colors.primary.dark,
  },
  subtitle: {
    ...Theme.text.caption,
    marginTop: -Theme.spacing.xs,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.accent.main,
  },
  user: {
    ...Theme.text.caption,
    marginTop: -Theme.spacing.xs,
    color: Colors.text.secondary,
  },
  signOutButton: {
    padding: Theme.spacing.xs,
  },
});

export default Header;
