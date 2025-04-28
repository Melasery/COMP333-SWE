import { Tabs } from "expo-router";

export default function appLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="create" options={{ title: "Create" }} />
      <Tabs.Screen name="list" options={{ title: "Read" }} />
      <Tabs.Screen name="update" options={{ title: "Update" }} />
      <Tabs.Screen name="delete" options={{ title: "Delete"}} />
      <Tabs.Screen name="logout" options={{ title: "Profile" }} />
    </Tabs>
  );
}

