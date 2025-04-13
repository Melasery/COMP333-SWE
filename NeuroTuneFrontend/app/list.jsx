import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import BASE_URL from "../constants/api";

export default function ListScreen() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`${BASE_URL}/rating/list`);
      const data = await response.json();
      setRatings(data);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.user}>👤 {item.username}</Text>
      <Text style={styles.song}>🎵 {item.song}</Text>
      <Text style={styles.artist}>🎤 {item.artist}</Text>
      <Text style={styles.rating}>⭐ {item.rating}/9</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Ratings</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={ratings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
