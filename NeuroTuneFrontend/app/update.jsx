import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import BASE_URL from "../constants/api";

export default function UpdateScreen() {
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [rating, setRating] = useState("");

  const fetchRatingById = async () => {
    try {
      const res = await fetch(`${BASE_URL}/rating/get?id=${id}`);
      const data = await res.json();
      setUsername(data.username);
      setSong(data.song);
      setArtist(data.artist);
      setRating(data.rating.toString());
    } catch (err) {
      console.error("Failed to fetch rating:", err);
      Alert.alert("Error", "Could not find rating with that ID.");
    }
  };

  const updateRating = async () => {
    try {
      const res = await fetch(`${BASE_URL}/rating/update?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, song, artist, rating: parseInt(rating) }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      Alert.alert("Success", "Rating updated successfully!");
      console.log(data);
    } catch (err) {
      console.error("Failed to update rating:", err);
      Alert.alert("Error", "Failed to update rating.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update a Rating</Text>

      <TextInput
        placeholder="Rating ID"
        value={id}
        onChangeText={setId}
        style={styles.input}
      />
      <Button title="Load Rating" onPress={fetchRatingById} />

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
      <Button title="Submit Update" onPress={updateRating} />
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
