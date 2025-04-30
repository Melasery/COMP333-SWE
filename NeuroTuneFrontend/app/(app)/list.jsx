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

export default function ListScreen() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  let ratingEmotions = [];

  // Fetch all ratings (and ratios)
  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/rating/list`, {
        credentials: "include",
      });
      const data = await response.json();
      let arr = Array.isArray(data) ? data : data.ratings;

      setRatings(arr || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stubbed—just logs the button press for now
  const handleEmotionPress = async (rSong, rArtist, emotion) => {
    console.log(user);
    const rUser = user.username;
    //console.log(`Emotion "${emotion}" clicked on rating #${ratingId}`);
    let sad = false;
    let happy = false;
    let excited = false;
    let fear = false;
    let anger = false;
    let nostalgia = false;
    if (emotion === "sad") {
      sad = true;
    }
    else if (emotion === "happy") {
      happy = true;
    }
    else if (emotion === "excited") {
      excited = true;
    }
    else if (emotion === "fear") {
      fear = true;
    }
    else if (emotion === "anger") {
      anger = true;
    }
    else {
      nostalgia = true;
    }
      try {
        let response = await fetch(`${BASE_URL}/data/addEmotion`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            "user" : rUser,
            "song" : rSong,
            "artist" : rArtist,
            "sad": sad,
            "happy": happy,
            "excited": excited,
            "fear": fear,
            "anger": anger,
            "nostalgia": nostalgia
          })
        });

        let data = await response.json();

        console.log(data);
      } catch (err) {
        console.error("Error uploading emotion: " + err);
      }
  }


  useEffect(() => {
    fetchRatings();
  }, []);
  /*
  <Text>😊 {item.happy?.toFixed(2) ?? "0.00"}</Text>
        <Text>😢 {item.sad}</Text>
        <Text>😃 {item.excited?.toFixed(2) ?? "0.00"}</Text>
        <Text>😱 {item.fear?.toFixed(2) ?? "0.00"}</Text>
        <Text>😡 {item.anger?.toFixed(2) ?? "0.00"}</Text>
        <Text>🥲 {item.nostalgia?.toFixed(2) ?? "0.00"}</Text>
  */
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
              onPress={() => handleEmotionPress(item.song, item.artist, emo)}
            />
          </View>
        ))}
      </View>

      <View style={styles.ratiosContainer}>
        
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
