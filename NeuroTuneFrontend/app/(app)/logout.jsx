import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import BASE_URL from "../../constants/api";

export default function Logout() {
  const { user, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [buttons, setButtons] = useState(
    Array.from({ length: 10 }, () => ({ label: "excluded", checked: false }))
  );
  const [bestSong, setBestSong] = useState(null);
  const [similarityWeight] = useState(1);

  // Utility functions (unchanged logic)
  function containsObject(obj, list) {
    return list.includes(obj);
  }

  function containsSong(song, artist, list) {
    return list.some(item => item.song === song && item.artist === artist);
  }

  function updateCandidates(existingPoints, newPoints) {
    const idx = existingPoints.findIndex(p => p.song === newPoints.song && p.artist === newPoints.artist);
    if (idx > -1) {
      existingPoints[idx].points += newPoints.points;
    } else {
      existingPoints.push({ ...newPoints });
    }
  }

  function findTop(suggestions) {
    return suggestions.reduce(
      (top, cur) => (cur.points > top.points ? cur : top),
      { song: "", artist: "", points: 0 }
    );
  }

  async function generateSuggestion(bases, candidates) {
    let candidatePoints = [];
    for (let x = 0; x < bases.length; x++) {
      for (let y = 0; y < candidates.length; y++) {
        let similarity = 0;
        try {
          const response = await fetch(`${BASE_URL}/data/getSim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              song1: bases[x].song,
              artist1: bases[x].artist,
              song2: candidates[y].song,
              artist2: candidates[y].artist
            })
          });
          const json = await response.json();
          if (json.message === "Song found") similarity = json.data;
        } catch (err) {
          console.error(err);
        }

        const totalScore = similarityWeight * similarity;
        updateCandidates(candidatePoints, {
          song: candidates[y].song,
          artist: candidates[y].artist,
          points: totalScore
        });
      }
    }
    const top = findTop(candidatePoints);
    setBestSong(top);
  }

  // Main suggestion flow
  const getTopSuggestion = async () => {
    let userRatings = [];
    let suggestionBases = [];

    try {
      const res = await fetch(`${BASE_URL}/rating/userlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      if (!res.ok) throw new Error(res.statusText);
      userRatings = await res.json();
    } catch (err) {
      console.error(err);
    }

    userRatings.forEach(r => {
      if (
        containsObject(r.rating, selectedRatings) &&
        !containsSong(r.song, r.artist, suggestionBases)
      ) {
        suggestionBases.push({ song: r.song, artist: r.artist, rating: r.rating });
      }
    });

    let nonUserRatings = [];
    try {
      const res = await fetch(`${BASE_URL}/rating/nonUserList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      if (!res.ok) throw new Error(res.statusText);
      nonUserRatings = await res.json();
    } catch (err) {
      console.error(err);
    }

    const candidates = [];
    nonUserRatings.forEach(r => {
      if (!containsSong(r.song, r.artist, candidates)) {
        candidates.push({ song: r.song, artist: r.artist, rating: r.rating });
      }
    });

    await generateSuggestion(suggestionBases, candidates);
  };

  const ratingSelectionChange = (index) => {
    const updated = [...buttons];
    updated[index].checked = !updated[index].checked;
    updated[index].label = updated[index].checked ? "included" : "excluded";
    setButtons(updated);

    const ratingVal = index;
    setSelectedRatings(prev =>
      updated[index].checked
        ? [...prev, ratingVal]
        : prev.filter(v => v !== ratingVal)
    );
  };

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Logged in as <Text style={styles.username}>{username}</Text></Text>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Song</Text>
          <Text style={styles.suggestionText}>
            {bestSong ? `${bestSong.song} by ${bestSong.artist}` : "No suggestion yet"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>
          <Text style={styles.sectionSub}>Base suggestion off of these ratings:</Text>
          <View style={styles.buttonsRow}>
            {buttons.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.ratingButton,
                  btn.checked && styles.ratingButtonActive
                ]}
                onPress={() => ratingSelectionChange(idx)}
              >
                <Text style={[
                  styles.ratingText,
                  btn.checked && styles.ratingTextActive
                ]}>
                  {`${idx} - ${btn.label}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.suggestButton} onPress={getTopSuggestion}>
            <Text style={styles.suggestText}>Suggest New Song</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  content: { padding: 16, alignItems: 'center' },
  header: { fontSize: 18, color: '#333', marginBottom: 8 },
  username: { fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: '#e74c3c', paddingVertical: 12,
    paddingHorizontal: 24, borderRadius: 24,
    marginBottom: 24
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  section: { width: '100%', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  sectionSub: { fontSize: 16, color: '#555', marginBottom: 12 },
  suggestionText: { fontSize: 16, color: '#555' },
  buttonsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  ratingButton: {
    borderWidth: 1, borderColor: '#aaa',
    borderRadius: 20, padding: 8, margin: 4,
    backgroundColor: '#fff'
  },
  ratingButtonActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  ratingText: { fontSize: 14, color: '#333' },
  ratingTextActive: { color: '#fff' },
  suggestButton: {
    backgroundColor: '#3498db', paddingVertical: 12,
    paddingHorizontal: 24, borderRadius: 24,
    alignSelf: 'center'
  },
  suggestText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
