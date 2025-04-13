// app/_layout.js
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="create" options={{ title: "Create" }} />
      <Tabs.Screen name="list" options={{ title: "List" }} />
      <Tabs.Screen name="update" options={{ title: "Update" }} />
      <Tabs.Screen name="delete" options={{ title: "Delete" }} />
    </Tabs>
  );
}
