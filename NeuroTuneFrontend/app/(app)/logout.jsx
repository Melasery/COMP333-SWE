import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch
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
  const [similarityWeight, setSimilarityWeight] = useState(99);

  const [firstChoiceUser, setFirstChoiceUser] = useState("");
  const [secondChoiceUser, setSecondChoiceUser] = useState("");
  const [thirdChoiceUser, setThirdChoiceUser] = useState("");

  const [ratingComponentProximity, setRatingComponentProximity] = useState(false);
  const [ratingEmptyAverage, setRatingEmptyAverage] = useState(false);
  const [rComponentWeight, setRComponentRate] = useState(99);

  const [emotionOnlyTop, setEmotionOnlyTop] = useState(false);
  const[emotionWeight, setEmotionWeight] = useState(99);

  const [flatRatingWeight, setFlatRatingWeight] = useState(false);

  function containsObject(obj, list) {
    return list.includes(obj);
  }

  function containsSong(song, artist, list) {
    return list.some(item => item.song === song && item.artist === artist);
  }

  function updateCandidates(existingPoints, newPoints) {
    const idx = existingPoints.findIndex(
      p => p.song === newPoints.song && p.artist === newPoints.artist
    );
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
          if (json.message === "Song found") {
            similarity = json.data;
          }
        } catch (err) {
          console.error(err);
        }
        console.log("Similarity for " + candidates[y].song + ": " + similarity);
        let ratingComponent = 0;
        let usernamesFound = 0;
        for (let a = 0; a < 3; a++) {
          try {
            const responseBase = await fetch(`${BASE_URL}/rating/getUserSongArtist`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: firstChoiceUser, song: bases[x].song, artist: bases[x].artist })
            });
            const responseCandidate = await fetch(`${BASE_URL}/rating/getUserSongArtist`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: firstChoiceUser, song: candidates[y].song, artist: candidates[y].artist })
            });
            const jsonBase = await responseBase.json();
            const jsonCandidate = await responseCandidate.json();
            if (jsonBase.message === "rating found" && jsonCandidate.message === "rating found" && ratingComponentProximity) {
              usernamesFound++;
              ratingComponent += 100 - Math.abs(jsonCandidate.rating - jsonBase.rating);
            } else if (jsonCandidate.message === "rating found" && !ratingComponentProximity) {
              usernamesFound++;
              ratingComponent += 10 * (jsonCandidate.rating + 1);
            }
          } catch (err) {
            console.error(err);
          }
        }
        if (usernamesFound === 0) {
          ratingComponent = ratingEmptyAverage ? 50 : 0;
        } else {
          ratingComponent = ratingComponent / usernamesFound;
        }

        let baseEmotions = [0,0,0,0,0,0];
        let candidateEmotions = [0,0,0,0,0,0];
        try {
          const emotionResponseBase = await fetch(`${BASE_URL}/data/getEmotionTally`, {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({song: bases[x].song, artist: bases[x].artist})
          });

          const emotionBaseData = await emotionResponseBase.json();
          if (emotionBaseData.total !== 0) {
            baseEmotions = [(emotionBaseData.sad / emotionBaseData.total), (emotionBaseData.happy / emotionBaseData.total), (emotionBaseData.excited / emotionBaseData.total), (emotionBaseData.fear / emotionBaseData.total), (emotionBaseData.anger / emotionBaseData.total), (emotionBaseData.nostalgia / emotionBaseData.total)];
          }

          const emotionResponseCand = await fetch(`${BASE_URL}/data/getEmotionTally`, {
            method: "POST",
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify({song: candidates[y].song, artist: candidates[y].artist})
          });

          const emotionCandData = await emotionResponseCand.json();
          if (emotionCandData.total !== 0) {
            candidateEmotions = [(emotionCandData.sad / emotionCandData.total), (emotionCandData.happy / emotionCandData.total), (emotionCandData.excited / emotionCandData.total), (emotionCandData.fear / emotionCandData.total), (emotionCandData.anger / emotionCandData.total), (emotionCandData.nostalgia / emotionCandData.total)];
          }
        } catch (err) {
          console.error("Error retrieving emotion tally: " + err);
        }

        let emotionScore = 0;
        if (emotionOnlyTop) {
          let topIndex = 0;
          for (let i = 0; i < 6; i++) {
            if(baseEmotions[topIndex] < baseEmotions[i]) {
              topIndex = i;
            }
          }
          emotionScore = 100 * (1 - (Math.abs(baseEmotions[topIndex] - candidateEmotions[topIndex])));
        } else {
          for (let i = 0; i < 6; i++) {
            emotionScore += 100 * (1 - (Math.abs(baseEmotions[i] - candidateEmotions[i])));
          }
          emotionScore = emotionScore / 6;
        }
        console.log("Emotion score for " + candidates[y].song + ": " + emotionScore);
        let totalScore = flatRatingWeight
          ? ((similarityWeight / 100) * similarity) + ((rComponentWeight / 100) * ratingComponent) + ((emotionWeight / 100) * emotionScore)
          : (bases[x].rating + 1) * (((similarityWeight / 100) * similarity) + ((rComponentWeight / 100) * ratingComponent) + ((emotionWeight / 100) * emotionScore));
        updateCandidates(candidatePoints, { song: candidates[y].song, artist: candidates[y].artist, points: totalScore });
      }
    }
    const top = findTop(candidatePoints);
    setBestSong(top);
  }

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
      if (containsObject(r.rating, selectedRatings) && !containsSong(r.song, r.artist, suggestionBases)) {
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
    await generateSuggestion(suggestionBases, candidates);
  };

  const ratingSelectionChange = (index) => {
    const updated = [...buttons];
    updated[index].checked = !updated[index].checked;
    updated[index].label = updated[index].checked ? "included" : "excluded";
    setButtons(updated);
    const ratingVal = index;
    setSelectedRatings(prev =>
      updated[index].checked ? [...prev, ratingVal] : prev.filter(v => v !== ratingVal)
    );
  };

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>
          Logged in as <Text style={styles.username}>{username}</Text>
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Song</Text>
          <Text style={styles.suggestionText}>{bestSong ? `${bestSong.song} by ${bestSong.artist}` : "No suggestion yet"}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lyric Similarity</Text>
          <Text style={styles.sectionSub}>How much should lyrical similarity be weighted (0-99)?</Text>
          <TextInput
            style={styles.input}
            placeholder="Similarity (0-99)"
            value={String(similarityWeight)}
            onChangeText={text => setSimilarityWeight(Number(text))}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.sectionTitle}>Other User's Ratings</Text>
          <Text style = {styles.sectionSub}>First user:</Text>
          <TextInput
            style={styles.input}
            placeholder="First user"
            value={firstChoiceUser}
            onChangeText={setFirstChoiceUser}
          />
          <Text style = {styles.sectionSub}>Second user:</Text>
          <TextInput
            style={styles.input}
            placeholder="Second user"
            value={secondChoiceUser}
            onChangeText={setSecondChoiceUser}
          />
          <Text style = {styles.sectionSub}>Third user:</Text>
          <TextInput
            style={styles.input}
            placeholder="Third user"
            value={thirdChoiceUser}
            onChangeText={setThirdChoiceUser}
          />
          <Text style={styles.sectionsSub}>Base suggestion off of proximity of ratings or how high the songs are rated?</Text>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>High rating</Text>
            <Switch value={ratingComponentProximity} onValueChange={setRatingComponentProximity} />
            <Text style={styles.toggleLabel}>Proximity</Text>
          </View>
          <Text style={styles.sectionsSub}>If no ratings are found, weight the component as negative or as average?</Text>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Negative</Text>
            <Switch value={ratingEmptyAverage} onValueChange={setRatingEmptyAverage} />
            <Text style={styles.toggleLabel}>Average</Text>
          </View>
          <Text style={styles.sectionSub}>How much should other user's ratings be weighted (0-99)?</Text>
          <TextInput
            style={styles.input}
            placeholder="Rating weight (0-99)"
            value={String(rComponentWeight)}
            onChangeText={text => setRComponentRate(Number(text))}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style = {styles.sectionTitle}>Emotions</Text>
          <Text style={styles.sectionSub}>Compare all emotions or only the top emotion?</Text>
          <View style={styles.toggleContainer}>
            <Text style = {styles.toggleLabel}>All</Text>
            <Switch value = {emotionOnlyTop} onValueChange={setEmotionOnlyTop}/>
            <Text style = {styles.toggleLabel}>Only top</Text>
          </View>
          <Text style={styles.sectionSub}>How much should emotions be weighted (0-99)?</Text>
          <TextInput
            style={styles.input}
            placeholder="Emotion weight (0-99)"
            value={String(emotionWeight)}
            onChangeText={text => setEmotionWeight(Number(text))}
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
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>No</Text>
            <Switch value={flatRatingWeight} onValueChange={setFlatRatingWeight} />
            <Text style={styles.toggleLabel}>Yes</Text>
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
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 24
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  section: { width: '100%', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  sectionSub: { fontSize: 16, color: '#555', marginBottom: 12 },
  sectionsSub: { fontSize: 16, color: '#555', marginBottom: 12 },
  suggestionText: { fontSize: 16, color: '#555' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    width: '100%',
    marginBottom: 12
  },
  buttonsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  ratingButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    padding: 8,
    margin: 4,
    backgroundColor: '#fff'
  },
  ratingButtonActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  ratingText: { fontSize: 14, color: '#333' },
  ratingTextActive: { color: '#fff' },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  toggleLabel: {
    fontSize: 16,
    color: '#555',
    marginHorizontal: 8
  },
  suggestButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'center'
  },
  suggestText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
