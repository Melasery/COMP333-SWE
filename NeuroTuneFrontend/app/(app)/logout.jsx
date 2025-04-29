import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Button, Text} from "react-native";
import { useAuth } from "../../context/AuthContext"; 
import BASE_URL from "../../constants/api"; // Your API base URL


export default function Logout() {
  //Sets the user variable to null, returning the app to the login section.
  const { user } = useAuth();
  const { logout } = useAuth();
  const [username, setUsername] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [button0, setButton0] = useState("excluded");
  const [checked0, setChecked0] = useState(false);
  const [button1, setButton1] = useState("excluded");
  const [checked1, setChecked1] = useState(false);
  const [button2, setButton2] = useState("excluded");
  const [checked2, setChecked2] = useState(false);
  const [button3, setButton3] = useState("excluded");
  const [checked3, setChecked3] = useState(false);
  const [button4, setButton4] = useState("excluded");
  const [checked4, setChecked4] = useState(false);
  const [button5, setButton5] = useState("excluded");
  const [checked5, setChecked5] = useState(false);
  const [button6, setButton6] = useState("excluded");
  const [checked6, setChecked6] = useState(false);
  const [button7, setButton7] = useState("excluded");
  const [checked7, setChecked7] = useState(false);
  const [button8, setButton8] = useState("excluded");
  const [checked8, setChecked8] = useState(false);
  const [button9, setButton9] = useState("excluded");
  const [checked9, setChecked9] = useState(false);

  const[similarityWeight, setSimilarityWeight] = useState(1);

  const [bestSong, setBestSong] = useState(null);

  function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
  }

  function containsSong(song, artist, list) {
    var i;
    for (i=0; i<list.length; i++) {
      if (list[i].song === song && list[i].artist === artist) {
        return true;
      }
    }
    return false;
  }

  function updateCandidates(existingPoints, newPoints) {
    for (i=0; i<existingPoints.length; i++) {
      if (existingPoints[i].song === newPoints.song && existingPoints[i].artist === newPoints.artist) {
        existingPoints[i].points = newPoints.points + existingPoints[i].points;
        console.log("Added " + newPoints.points + " points to " + newPoints.song + " by " + newPoints.artist);
        return existingPoints;
      }
    }
    console.log("Added " + newPoints.points + " points to " + newPoints.song + " by " + newPoints.artist);
    existingPoints.push({"song": newPoints.song, "artist": newPoints.artist, "points": newPoints.points});
  }

  function findTop(suggestions) {
    let topCandidate = {"song": "", "artist": "", "points": 0};
    for (i=0; i < suggestions.length; i++) {
      if (suggestions[i].points > topCandidate.points) {
        topCandidate = suggestions[i];
      }
    }
    console.log("Top Candidate: " + topCandidate);
    return topCandidate;
  }

  async function generateSuggestion(bases, candidates) {
    let candidatePoints = [];
    for (x=0; x < bases.length; x++)  {
      for (y=0; y< candidates.length; y++) {
        let similarity = 0;
        try {
          const response = await fetch(`${BASE_URL}/data/getSim`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              "song1": bases[x].song,
              "artist1": bases[x].artist,
              "song2": candidates[y].song,
              "artist2": candidates[y].artist
            })
          });

          const text = await response.json();
          if (text.message === "Song found") {
            console.log(text.data);
            similarity = text.data;
          }
      } catch (err) {
        console.error("Error finding similarity: " + err);
      }

      //Add more stuff for other components here

      //Algorithms for calculating individual components
      let similarityComponent = similarity;

      //Algorithm for entire points
      let totalScore = similarityWeight * similarityComponent;
      updateCandidates(candidatePoints, {"song": candidates[y].song, "artist": candidates[y].artist, "points": totalScore});

    }
  }
  console.log(candidatePoints);
  let top = findTop(candidatePoints);
  setBestSong(top);
  return(top);
  }  

  const getTopSuggestion = async () => {
    console.log(selectedRatings);

    let userRatings = [];
    let suggestionBases = [];
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
      //console.log("Raw update response: ", text);
      if(isJson) {
        userRatings = text;
      } else {
        Alert.alert("Error:", "Check server - response was not JSON.");
      }
    } catch (err) {
      console.error("Error listing user ratings:", err);
      userRatings = [];
    } finally {
      console.log(userRatings);
      for (let i = 0; i < userRatings.length; i++) {
        if (!containsSong(userRatings[i].song, userRatings[i].artist, suggestionBases) && containsObject(userRatings[i].rating, selectedRatings)) {
          try {
            const validRes = await fetch(`${BASE_URL}/data/getSong`, {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                "song": userRatings[i].song,
                "artist": userRatings[i].artist
              })
            });
  
            const validResText = await validRes.json();
            //console.log("ValidResText: "+ validResText)
            if (validResText.message === "Song found") {
              suggestionBases.push({"song": userRatings[i].song, "artist": userRatings[i].artist, "rating": userRatings[i].rating})
              //console.log("song added");
            }
          } catch (err) {
            console.error("Error validating suggestion bases: " + err);
          }
        }

        //console.log(userRatings[i].song);
        //console.log(userRatings[i].artist);
        //console.log(i);
      }

      console.log("Bases: " + suggestionBases);
    }
    let nonUserRatings = [];
    let suggestionCandidates = [];
    try {
      const excResponse = await fetch(`${BASE_URL}/rating/nonUserList`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          "username": username
        }),
      });

      if (!excResponse.ok) {
        throw new Error('HTTP error! status: ${response.status}');
      }
      nonUserRatings = await excResponse.json();
    } catch (err) {
      console.error("Error listing user ratings:", err);
      userRatings = [];
    } finally {
      //console.log(nonUserRatings);
      for (let i = 0; i < nonUserRatings.length; i++) {
        if (!containsSong(nonUserRatings[i].song, nonUserRatings[i].artist, suggestionCandidates)) {
          try {
            const candRes = await fetch(`${BASE_URL}/data/getSong`, {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                "song": nonUserRatings[i].song,
                "artist": nonUserRatings[i].artist
              })
            });
  
            const candResText = await candRes.json();
            //console.log("candResText: "+ candResText)
            if (candResText.message === "Song found") {
              suggestionCandidates.push({"song": nonUserRatings[i].song, "artist": nonUserRatings[i].artist, "rating": nonUserRatings[i].rating})
              //console.log("song added");
            }
          } catch (err) {
            console.error("Error validating suggestion candidatites: " + err);
          }
        }

        //console.log(userRatings[i].song);
        //console.log(userRatings[i].artist);
        //console.log(i);
      }

      console.log("Candidates: " + suggestionCandidates);

      generateSuggestion(suggestionBases, suggestionCandidates);

    }
  }

  const ratingSelectionChange = (checked, value) => {
    if (checked === true) {
      setSelectedRatings([...selectedRatings, value]);
    }
    else if (checked === false){
      let freshArray = selectedRatings.filter(v => v !== value);
      setSelectedRatings([...freshArray]);
    }
  }

  useEffect(() => {
    if (user.username != null) {
        setUsername(user.username);
    }
    else {
        setUsername("");
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>You are currently logged in as: {username}</Text>
      <Text>Log Out?</Text>
      <Button title="Yes" onPress={() => logout()}/>
      <Text>Suggested Song:</Text>
      <Text>Options:</Text>
      <Text>Base suggestion off of these ratings:</Text>
      <Button title={"0 - " + button0} onPress={() => {if (checked0 === false) {setChecked0(true); setButton0("included"); ratingSelectionChange(true, 0)} else {setChecked0(false); setButton0("excluded"); ratingSelectionChange(false, 0)}}}/>
      <Button title={"1 - " + button1} onPress={() => {if (checked1 === false) {setChecked1(true); setButton1("included"); ratingSelectionChange(true, 1)} else {setChecked1(false); setButton1("excluded"); ratingSelectionChange(false, 1)}}}/>
      <Button title={"2 - " + button2} onPress={() => {if (checked2 === false) {setChecked2(true); setButton2("included"); ratingSelectionChange(true, 2)} else {setChecked2(false); setButton2("excluded"); ratingSelectionChange(false, 2)}}}/>
      <Button title={"3 - " + button3} onPress={() => {if (checked3 === false) {setChecked3(true); setButton3("included"); ratingSelectionChange(true, 3)} else {setChecked3(false); setButton3("excluded"); ratingSelectionChange(false, 3)}}}/>
      <Button title={"4 - " + button4} onPress={() => {if (checked4 === false) {setChecked4(true); setButton4("included"); ratingSelectionChange(true, 4)} else {setChecked4(false); setButton4("excluded"); ratingSelectionChange(false, 4)}}}/>
      <Button title={"5 - " + button5} onPress={() => {if (checked5 === false) {setChecked5(true); setButton5("included"); ratingSelectionChange(true, 5)} else {setChecked5(false); setButton5("excluded"); ratingSelectionChange(false, 5)}}}/>
      <Button title={"6 - " + button6} onPress={() => {if (checked6 === false) {setChecked6(true); setButton6("included"); ratingSelectionChange(true, 6)} else {setChecked6(false); setButton6("excluded"); ratingSelectionChange(false, 6)}}}/>
      <Button title={"7 - " + button7} onPress={() => {if (checked7 === false) {setChecked7(true); setButton7("included"); ratingSelectionChange(true, 7)} else {setChecked7(false); setButton7("excluded"); ratingSelectionChange(false, 7)}}}/>
      <Button title={"8 - " + button8} onPress={() => {if (checked8 === false) {setChecked8(true); setButton8("included"); ratingSelectionChange(true, 8)} else {setChecked8(false); setButton8("excluded"); ratingSelectionChange(false, 8)}}}/>
      <Button title={"9 - " + button9} onPress={() => {if (checked9 === false) {setChecked9(true); setButton9("included"); ratingSelectionChange(true, 9)} else {setChecked9(false); setButton9("excluded"); ratingSelectionChange(false, 9)}}}/>
      <Button title = "Suggest new song" onPress={()=> getTopSuggestion()}/>
      <Text>{(bestSong != null) ? `Top Suggestion based on these settings: ${bestSong.song} by ${bestSong.artist}` : ""}</Text>
    </View>
  );
}
