import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import BASE_URL from "../../constants/api";
//import { TextInput } from "react-native-web";

export default function Logout() {
  const { user, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [buttons, setButtons] = useState(
    Array.from({ length: 10 }, () => ({ label: "excluded", checked: false }))
  );
  const [bestSong, setBestSong] = useState(null);
  const [similarityWeight, setSimilarityWeight] = useState(99);

  const [firstChoiceUser, setFirstChoiceUser] = useState("");
  const [secondChoiceUser, setSecondChoiceUser] = useState("");
  const [thirdChoiceUser, setThirdChoiceUser] = useState("");
  const [ratingComponentProximity, setRatingComponentProximity] = useState(false);
  const [ratingEmptyAverage, setRatingEmptyAverage] = useState(false);
  const [rComopnentWeight, setRComponentRate] = useState(99);

  const [flatRatingWeight, setFlatRatingWeight] = useState(false);

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
    console.log(existingPoints);
  }

  function findTop(suggestions) {
    return suggestions.reduce(
      (top, cur) => (cur.points > top.points ? cur : top),
      { song: "", artist: "", points: 0 }
    );
  }

  async function generateSuggestion(bases, candidates) {
    let candidatePoints = [];
    console.log(bases.length);
    for (let x = 0; x < bases.length; x++) {
      console.log("BASES: " + bases[x].song + " (" + x + ")");
      for (let y = 0; y < candidates.length; y++) {
        
        console.log("Testing" + candidates[y].song + " and " + bases[x].song);
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
          if (json.message === "Song found") {
            similarity = json.data;
          }
        } catch (err) {
          console.error(err);
        }
        let ratingComponent = 0;
        let usernamesFound = 0;
        for (a=0; a < 3; a ++) {
          try {
              const responseBase = await fetch(`${BASE_URL}/rating/getUserSongArtist`, {
              method: "POST",
              headers: { "Content-Type": "application/json"},
              body: JSON.stringify({
                username: firstChoiceUser,
                song: bases[x].song,
                artist: bases[x].artist
              })
            });

            const responseCandidate = await fetch(`${BASE_URL}/rating/getUserSongArtist`, {
              method: "POST",
              headers: { "Content-Type": "application/json"},
              body: JSON.stringify({
               username: firstChoiceUser,
                song: candidates[y].song,
                artist: candidates[y].artist
              })
            });

            const jsonBase = await responseBase.json();
            const jsonCandidate = await responseCandidate.json();
            console.log(jsonBase.message); console.log(jsonCandidate.message);
            if (jsonBase.message === "rating found" && jsonCandidate.message === "rating found" && ratingComponentProximity) {
              usernamesFound += 1;
              console.log(100 - Math.abs(jsonCandidate.rating - jsonBase.rating));
              ratingComponent += (100 - Math.abs(jsonCandidate.rating - jsonBase.rating));
              console.log(ratingComponent + " - Rating Component Score for this song combo");
            } else if (jsonCandidate.message === "rating found" && !ratingComponentProximity) {
              usernamesFound += 1;
              ratingComponent += 10 * (jsonCandidate.rating + 1);
              console.log(ratingComponent + " - Rating Component Score for this song combo");
            }
          } catch (err) {
            console.error(err);
          }
        }
        if (usernamesFound === 0) {
          if(ratingEmptyAverage) {
            console.log("setting ratingComponent to 50");
            ratingComponent = 50;
          } else {
            console.log("setting ratingComponent to 0");
            ratingComponent = 0;
          }
        } else {
          ratingComponent = ratingComponent / usernamesFound;
        }
        console.log("total score calcs");
        let totalScore = 0;
        if (flatRatingWeight) {
          console.log("Flat Rate");
          totalScore = (((similarityWeight/100) * similarity) + ((rComopnentWeight/100) * ratingComponent));
        }
        else {
          totalScore = (bases[x].rating + 1) * (((similarityWeight/100) * similarity) + ((rComopnentWeight/100) * ratingComponent))
        }
        console.log(totalScore + candidates[y].song + candidates[y].artist);
        updateCandidates(candidatePoints, {
          song: candidates[y].song,
          artist: candidates[y].artist,
          points: totalScore
        });
        console.log("song updated");
      }
      console.log("NEXT BASE");
    }
    console.log("end suggestion reached");
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
      if (!containsSong(r.song, r.artist, candidates) && !containsSong(r.song, r.artist, suggestionBases)) {
        candidates.push({ song: r.song, artist: r.artist, rating: r.rating });
      }
    });
    console.log(suggestionBases);
    console.log(candidates);
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
          <Text style={styles.sectionTitle}>Lyric Similarity</Text>
          <Text style={styles.sectionSub}>How much should lyrical similarity be weighted (0-99)?</Text>
          <TextInput
            placeholder = "Similarity (0-99)"
            defaultValue="99"
            value = {similarityWeight}
            onChangeText={setSimilarityWeight}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.sectionTitle}>Other User's Ratings</Text>
          <Text style={styles.sectionsub}>First user:</Text>
          <TextInput
            placeholder="First username"
            defaultValue="first user"
            value = {firstChoiceUser}
            onChangeText={setFirstChoiceUser}
          />
          <Text style={styles.sectionSub}>Second user:</Text>
          <TextInput
            placeholder="Second username"
            defaultValue="second user"
            value = {secondChoiceUser}
            onChangeText={setSecondChoiceUser}
          />
          <Text style={styles.sectionSub}>Third user:</Text>
          <TextInput
            placeholder="Third username"
            defaultValue="third user"
            value = {thirdChoiceUser}
            onChangeText={setThirdChoiceUser}
          />
          <Text style={styles.sectionsSub}>Base suggestion off of proximity of ratings or how high the songs are rated?</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={() => setRatingComponentProximity(true)}>
            <Text style={styles.suggestText}>Proximity</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestButton} onPress={() => setRatingComponentProximity(false)}>
            <Text style={styles.suggestText}>High rating</Text>
          </TouchableOpacity>
          
          <Text style={styles.sectionsSub}>If no ratings are found, weight the component as negative or as average?</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={() => setRatingEmptyAverage(false)}>
            <Text style={styles.suggestText}>Negative</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestButton} onPress={() => setRatingEmptyAverage(true)}>
            <Text style={styles.suggestText}>Average</Text>
          </TouchableOpacity>
          <Text style={styles.sectionSub}>How much should ratings be weighted (0-99)?</Text>
          <TextInput
            placeholder = "Rating (0-99)"
            defaultValue="99"
            value = {rComopnentWeight}
            onChangeText={setRComponentRate}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.sectionTitle}>Input Options</Text>
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

          <Text style={styles.sectionsSub}>Weight each rating equally?</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={() => setFlatRatingWeight(true)}>
          <Text style={styles.logoutText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestButton} onPress={() => setFlatRatingWeight(false)}>
          <Text style={styles.logoutText}>No</Text>
          </TouchableOpacity>

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
