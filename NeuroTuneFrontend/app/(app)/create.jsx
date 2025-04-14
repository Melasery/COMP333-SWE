import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import BASE_URL from "../constants/api";

export default function CreateScreen() {
  const [username, setUsername] = useState("");
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [rating, setRating] = useState("");

  const createRating = async () => {
    try {
      const response = await fetch(`${BASE_URL}/rating/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, song, artist, rating: parseInt(rating) }),
      });

      const text = await response.text();
      console.log("Raw response:", text);

      try {
        const data = JSON.parse(text);
        alert("Rating created!");
        console.log(data);
      } catch (err) {
        console.error("Failed to parse response as JSON:", err);
        alert("Server error (invalid JSON)");
      }
    } catch (err) {
      console.error("Error creating rating:", err);
      alert("Failed to create rating.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Rating</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Song Title"
        value={song}
        onChangeText={setSong}
        style={styles.input}
      />
      <TextInput
        placeholder="Artist"
        value={artist}
        onChangeText={setArtist}
        style={styles.input}
      />
      <TextInput
        placeholder="Rating (0-9)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Submit Rating" onPress={createRating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
});
