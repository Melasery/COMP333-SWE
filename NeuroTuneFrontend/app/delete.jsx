import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import BASE_URL from "../constants/api";

export default function DeleteScreen() {
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");

  const deleteRating = async () => {
    try {
      const res = await fetch(`${BASE_URL}/rating/delete?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      Alert.alert("Deleted", "Rating deleted successfully!");
      console.log(data);
    } catch (err) {
      console.error("Failed to delete rating:", err);
      Alert.alert("Error", "Failed to delete rating.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete a Rating</Text>
      <TextInput
        placeholder="Rating ID"
        value={id}
        onChangeText={setId}
        style={styles.input}
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <Button title="Delete Rating" onPress={deleteRating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
});
