import { useEffect, useState } from "react";
import { View, ActivityIndicator, Button, Text } from "react-native";

import { useAuth } from "../../context/AuthContext"; 

export default function Logout() {
  const { user } = useAuth();
  const { logout } = useAuth();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    if (user.username != null) {
        setUsername(user.username);
    }
    else {
        setUsername("");
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>You are currently logged in as: {username}</Text>
      <Text>Are you sure you want to log out?</Text>
      <Button title="Yes" onPress={() => logout()}/>
    </View>
  );
}
