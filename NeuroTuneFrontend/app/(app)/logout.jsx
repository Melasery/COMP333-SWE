import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext"; 

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout(); 
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
