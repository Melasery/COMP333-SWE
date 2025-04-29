import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import BASE_URL from "../../constants/api"; // Your API base URL

export default function CreateScreen() {
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [rating, setRating] = useState("");
  const [otherData, setOtherData] = useState([]);
  const [currSim, setCurrSim] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  //Sends create request to REST api
  const createRating = async () => {
    setLoading(true);
    const username = user.username;
    try {
      const response = await fetch(`${BASE_URL}/rating/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          song,
          artist,
          rating: parseInt(rating)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      const isJson = contentType && contentType.includes("application/json");
      const text = isJson ? await response.json() : await response.text();
      console.log("Raw create response:", text);

      if (isJson && text.message === "Rating created successfully") {
        // fetch lyrics and other data (unchanged)
        try {
          const lyrResponse = await fetch(
            `https://api.lyrics.ovh/v1/${artist}/${song}`,
            { headers: { "Content-Type": "application/json" } }
          );
          if (lyrResponse.ok) {
            const lyrText = await lyrResponse.json();
            if (lyrText.lyrics) {
              const lyrics = lyrText.lyrics;
              // upload lyrics
              const lPostRes = await fetch(`${BASE_URL}/data/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ song, artist, lyrics })
              });
              if (lPostRes.ok) {
                const odResponse = await fetch(
                  `${BASE_URL}/data/listExclusion`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ song, artist })
                  }
                );
                const odText = await odResponse.json();
                setOtherData(odText);
                // similarity calculations (unchanged)
                for (let i = 0; i < odText.length; i++) {
                  try {
                    const simResponse = await fetch(
                      "https://api.api-ninjas.com/v1/textsimilarity",
                      {
                        method: "POST",
                        headers: { "X-Api-Key": "gcSOweST4vXedgtN26Z3xg==Guqol9FxgYHuKUBT" },
                        body: JSON.stringify({
                          text_1: lyrics,
                          text_2: odText[i].lyrics
                        })
                      }
                    );
                    const simText = await simResponse.json();
                    await fetch(`${BASE_URL}/data/createSim`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        song1: song,
                        artist1: artist,
                        song2: odText[i].song,
                        artist2: odText[i].artist,
                        similarity: Math.round(simText.similarity * 100)
                      })
                    });
                  } catch (e) {
                    console.error("Error similarity step:", e);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error("Error lyrics flow:", e);
        }
        Alert.alert("Rating created successfully");
      } else {
        Alert.alert("Rating creation failed", text.message || "Please try again.");
      }
    } catch (err) {
      console.error("Error creating rating:", err);
      Alert.alert("Failed to create rating.");
    } finally {
      setLoading(false);
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
        editable={!loading}
      />
      <Text>Artist Name:</Text>
      <TextInput
        placeholder="Artist"
        value={artist}
        onChangeText={setArtist}
        style={styles.input}
        editable={!loading}
      />
      <Text>Rating:</Text>
      <TextInput
        placeholder="Rating (0-9)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        style={styles.input}
        maxLength={1}
        editable={!loading}
      />
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <Button title="Submit Rating" onPress={createRating} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6
  },
  loader: {
    marginTop: 20
  }
});
