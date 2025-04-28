import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import BASE_URL from "../../constants/api";

const EMOTIONS = ["sad", "happy", "excited", "fear", "anger", "nostalgia"];

export default function ListScreen() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all ratings (and ratios)
  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/rating/list`, {
        credentials: "include",
      });
      const data = await response.json();
      const arr = Array.isArray(data) ? data : data.ratings;
      setRatings(arr || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stubbed—just logs the button press for now
  const handleEmotionPress = (ratingId, emotion) => {
    console.log(`Emotion "${emotion}" clicked on rating #${ratingId}`);
    // TODO: hook up to your backend when ready
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

      <View style={styles.emotionsContainer}>
        {EMOTIONS.map((emo) => (
          <View key={emo} style={styles.emotionButton}>
            <Button
              title={emo}
              onPress={() => handleEmotionPress(item.id, emo)}
            />
          </View>
        ))}
      </View>

      <View style={styles.ratiosContainer}>
        <Text>😊 {item.happy_ratio?.toFixed(2) ?? "0.00"}</Text>
        <Text>😢 {item.sad_ratio?.toFixed(2) ?? "0.00"}</Text>
        <Text>😃 {item.excited_ratio?.toFixed(2) ?? "0.00"}</Text>
        <Text>😱 {item.fear_ratio?.toFixed(2) ?? "0.00"}</Text>
        <Text>😡 {item.anger_ratio?.toFixed(2) ?? "0.00"}</Text>
        <Text>🥲 {item.nostalgia_ratio?.toFixed(2) ?? "0.00"}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Ratings</Text>
      <Text style={styles.count}>Loaded {ratings.length} ratings</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={ratings}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
        />
      )}

      <Button title="Refresh List" onPress={fetchRatings} />
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
    marginBottom: 8,
    textAlign: "center",
  },
  count: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
    color: "#666",
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
  emotionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  emotionButton: {
    marginRight: 5,
    marginBottom: 5,
  },
  ratiosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
