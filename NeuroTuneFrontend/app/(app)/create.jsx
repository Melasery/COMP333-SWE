import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import BASE_URL from "../../constants/api"; // Your API base URL


export default function CreateScreen() {
  //const [username, setUsername] = useState("");
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [rating, setRating] = useState("");
  const { user } = useAuth();

  const createRating = async () => {
    const username = user.username;
    try {
      const response = await fetch(`${BASE_URL}/rating/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          "username": username, 
          "song": song, 
          "artist": artist, 
          "rating": parseInt(rating) 
        }),
      });

      if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
      
            const contentType = response.headers.get("Content-Type");
            const isJson = contentType && contentType.includes("application/json");
      
            const text = isJson ? await response.json() : await response.text();
            console.log("Raw create response:", text);
      
            if (isJson) {
              if (text.message === "Rating created successfully") {
                Alert.alert("Rating created!");
              } else {
                Alert.alert("Rating creation failed: ", text.message || "Please try again.");
              }
            } else {
              Alert.alert("Registration Possibly Worked", "Check server — response was not JSON.");
            }

    } catch (err) {
      console.error("Error creating rating:", err);
      Alert.alert("Failed to create rating.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Rating</Text>
      <Text>Song Title:</Text>
      <TextInput
        placeholder="Song Title"
        value={song}
        onChangeText={setSong}
        style={styles.input}
      />
      <Text>Artist Name:</Text>
      <TextInput
        placeholder="Artist"
        value={artist}
        onChangeText={setArtist}
        style={styles.input}
      />
      <Text>Rating:</Text>
      <TextInput
        placeholder="Rating (0-9)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        style={styles.input}
        maxLength={1}
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
