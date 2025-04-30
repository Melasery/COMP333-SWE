import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import BASE_URL from "../../constants/api";

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      setReply(data.reply || "No response.");
    } catch (err) {
      console.error("Error fetching chat:", err);
      setReply("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎧 AI Music Chat</Text>
      <Text style={styles.sub}>Ask the bot for a song or playlist based on a mood or vibe.</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Suggest a playlist for studying"
        value={message}
        onChangeText={setMessage}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <Button title="Ask" onPress={handleAsk} />
      )}

      <Text style={styles.responseTitle}>🎤 AI Reply:</Text>
      <Text style={styles.response}>{reply}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  sub: { fontSize: 14, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 10, marginBottom: 10
  },
  responseTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
  },
  response: {
    fontSize: 16,
    color: "#444",
    marginTop: 10,
  },
  loader: {
    marginVertical: 20
  }
});
