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
import { useAuth } from "../../context/AuthContext";

const EMOTIONS = ["sad", "happy", "excited", "fear", "anger", "nostalgia"];
const EMOJI_MAP = {
  sad: "😢",
  happy: "😊",
  excited: "😃",
  fear: "😱",
  anger: "😡",
  nostalgia: "🥹",
};

export default function ListScreen() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // track which emotion the current user picked per rating
  const [selectedEmotions, setSelectedEmotions] = useState({});

  // Fetch all ratings
  const fetchRatings = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${BASE_URL}/rating/list`, {
        credentials: "include",
      });
      const data = await resp.json();
      const arr = Array.isArray(data) ? data : data.ratings;
      setRatings(arr || []);
    } catch (err) {
      console.error("Error fetching ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Send emotion & mark it as selected
  const handleEmotionPress = async (song, artist, emotion) => {
    const flags = EMOTIONS.reduce(
      (acc, emo) => ({ ...acc, [emo]: emo === emotion }),
      {}
    );
    try {
      await fetch(`${BASE_URL}/data/addEmotion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.username,
          song,
          artist,
          ...flags,
        }),
      });
      const key = `${song}__${artist}`;
      setSelectedEmotions((prev) => ({ ...prev, [key]: emotion }));
    } catch (err) {
      console.error("Error uploading emotion:", err);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const renderItem = ({ item }) => {
    const key = `${item.song}__${item.artist}`;
    const chosen = selectedEmotions[key];

    return (
      <View style={styles.card}>
        <Text style={styles.user}>👤 {item.username}</Text>
        <Text style={styles.song}>🎵 {item.song}</Text>
        <Text style={styles.artist}>🎤 {item.artist}</Text>
        <Text style={styles.rating}>⭐ {item.rating}/9</Text>

        {/* emotion buttons */}
        <View style={styles.emotionsContainer}>
          {EMOTIONS.map((emo) => (
            <View key={emo} style={styles.emotionButton}>
              <Button
                title={emo}
                onPress={() =>
                  handleEmotionPress(item.song, item.artist, emo)
                }
              />
            </View>
          ))}
        </View>

        {/* highlight row of emojis in matching order */}
        <View style={styles.emojisRow}>
          {EMOTIONS.map((emo) => (
            <Text
              key={emo}
              style={[
                styles.emoji,
                chosen === emo && styles.selectedEmoji,
              ]}
            >
              {EMOJI_MAP[emo]}
            </Text>
          ))}
        </View>
      </View>
    );
  };

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

  emojisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  emoji: {
    fontSize: 24,
    opacity: 0.3,
  },
  selectedEmoji: {
    opacity: 1,
  },
});
