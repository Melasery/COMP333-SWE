import { Slot, useSegments, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Redirect authenticated users to app
      router.replace("/(app)");
    }
  }, [user, segments]);

  return <Slot />;
}
