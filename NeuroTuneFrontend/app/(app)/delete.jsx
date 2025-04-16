import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, Button, StyleSheet, Text, Alert, ActivityIndicator } from "react-native";
import BASE_URL from "../../constants/api"; // Your API base URL
import { useAuth } from "../../context/AuthContext";

export default function DeleteListScreen({navigation}) {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(0);
  const { user } = useAuth();
  const username = user.username;

  

  const fetchUserRatings = async () => {
    console.log(user);
    console.log(username);
    try {
      const response = await fetch(`${BASE_URL}/rating/userlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          "username": username
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
              if (text == []) {
                Alert.alert("You have no ratings." || "Create one and check again.");
              } else {
                setRatings(text);
              }
            } else {
              Alert.alert("Registration Possibly Worked", "Check server — response was not JSON.");
            }
  
    } catch (err) {
      console.error("Error listing ratings:", err);
      Alert.alert("Failed to list rating.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRating = async () => {
    try {
      const res = await fetch(`${BASE_URL}/rating/delete?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          "username": username }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      console.log(data);
    } catch (err) {
      console.error("Failed to delete rating:", err);
      Alert.alert("Error", "Failed to delete rating.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.user}>👤 {item.username}</Text>
      <Text style={styles.song}>🎵 {item.song}</Text>
      <Text style={styles.artist}>🎤 {item.artist}</Text>
      <Text style={styles.rating}>⭐ {item.rating}/9</Text>
      <Button 
        title = "Delete"
        onPress={() => {setId(item.id); Alert.alert(
          "Are you sure?", "Deleting " + item.song + " Rating",
          [
            {text: "Yes", onPress: () => {deleteRating(); fetchUserRatings();} },
            {text: "Cancel"}
          ]
        );
      }}
      />
    </View>
  );

  useEffect(() => {
    fetchUserRatings();
  }, []);
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
  card: {
    backgroundColor: "#f4f4f4",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
  },
  user: {
    fontWeight: "bold",
  },
  song: {
    marginTop: 4,
  },
  artist: {
    marginTop: 4,
  },
  rating: {
    marginTop: 4,
    color: "#555",
  },
});
