import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert, ActivityIndicator, FlatList } from "react-native";
import BASE_URL from "../../constants/api"; // Your API base URL
import { useAuth } from "../../context/AuthContext";


export default function UpdateScreen() {
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [rating, setRating] = useState("");
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listMode, setListMode] = useState(true);
  
  const { user } = useAuth();

  const fetchUserRatings = async() => {
    const username = user.username;
    
    console.log(user);
    console.log(username);
    try {
      const response = await fetch(`${BASE_URL}/rating/userlist`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          "username": username
        }),
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ${response.status}');
      }
      const contentType = response.headers.get("Content-Type");
      const isJson = contentType && contentType.includes("application/json");
      const text = isJson ? await response.json() : await response.text();
      console.log("Raw update response: ", text);
      if(isJson) {
        if (text == []) {
          Alert.alert("You have no ratings." || "Create one and check again.");
        } else {
          setRatings(text);
        }
      } else {
        Alert.alert("Registration Possibly Worked", "Check server - response was not JSON.");
      }
    } catch (err) {
      console.error("Error listing ratings:", err);
      Alert.alert("Failed to list rating.");
    }finally {
      setLoading(false);
    }
  };

    const renderItem = ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.user}>👤 {item.username}</Text>
        <Text style={styles.song}>🎵 {item.song}</Text>
        <Text style={styles.artist}>🎤 {item.artist}</Text>
        <Text style={styles.rating}>⭐ {item.rating}/9</Text>
        <Button 
          title = "Update"
          onPress={() => {setId(item.id); setSong(item.song); setArtist(item.artist); setRating(item.rating); setListMode(false)}}
        />
      </View>
    );
  
    useEffect(() => {
      fetchUserRatings();
    }, []);

    
  const updateRating = async () => {
    const username = user.username;
    try {
      const response = await fetch(`${BASE_URL}/rating/update?id=${id}`, {
        method: "PUT",
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
      
            const txt = isJson ? await response.json() : await response.txt();
            console.log("Raw create response:", txt);
      
            if (isJson) {
              if (txt.message === "Rating updated successfully") {
                Alert.alert("Rating updated!"); setListMode(true);
              } else {
                Alert.alert("Rating creation failed: ", txt.message || "Please try again.");
              }
            } else {
              Alert.alert("Registration Possibly Worked", "Check server — response was not JSON.");
            }

    } catch (err) {
      console.error("Failed to update rating:", err);
      Alert.alert("Error", "Failed to update rating.");
    }
  };
  
  if (listMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Ratings</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={ratings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        )}
        <Button title = "refresh list" onPress = {() => fetchUserRatings()}/>
      </View>
    );
  }
  else {
    return (
      <View style={styles.container}>
            <Text style={styles.title}>Add a New Rating</Text>
            <Text>Song Title:</Text>
            <TextInput
              placeholder="Song Title"
              defaultValue={song}
              value={song}
              onChangeText={setSong}
              style={styles.input}
            />
            <Text>Artist Name:</Text>
            <TextInput
              placeholder="Artist"
              defaultValue={artist}
              value={artist}
              onChangeText={setArtist}
              style={styles.input}
            />
            <Text>Rating:</Text>
            <TextInput
              placeholder="Rating (0-9)"
              defaultValue={rating.toString()}
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
              style={styles.input}
              maxLength={1}
            />
            <Button title="Submit Rating" onPress={() => {updateRating()}}/>
          </View>
    );
  }
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
