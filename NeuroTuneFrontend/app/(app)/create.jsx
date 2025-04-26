import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import BASE_URL from "../../constants/api"; // Your API base URL


export default function CreateScreen() {
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [rating, setRating] = useState("");
  const [otherData, setOtherData] = useState([]);
  const [currSim, setCurrSim] = useState(0);
  const { user } = useAuth();


  //Sends create request to REST api
  const createRating = async () => {
    const username = user.username;
    try {
      const response = await fetch(`${BASE_URL}/rating/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          "username": username, 
          "song": song, 
          "artist": artist, 
          "rating": parseInt(rating) 
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
              if (text.message === "Rating created successfully") {
                try {
                  const lyrResponse = await fetch(`https://api.lyrics.ovh/v1/${artist}/${song}`, {
                    method: "GET",
                    headers: {"Content-Type": "application/json"}
                  });
                  if (!lyrResponse.ok) {
                    console.log("Lyric Response not OK")
                  }
                  else {
                    const lyrContentType = lyrResponse.headers.get("Content-Type");
                    const lyrIsJson = lyrContentType && lyrContentType.includes("application/json");
              
                    const lyrText = lyrIsJson ? await lyrResponse.json() : await lyrResponse.text();
                    console.log("Lyrics found");
                    if (lyrIsJson && lyrText.lyrics !== "") {
                      const lyrics = lyrText.lyrics;
                    
                      try {
                        const lPostRes = await fetch(`${BASE_URL}/data/create`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json"},
                          body: JSON.stringify({
                            "song": song,
                            "artist": artist,
                            "lyrics": lyrics
                          })
                        });
                        
                        if (!lPostRes.ok) {
                          console.log("Lyrics upload failed");
                        }
                        else {
                          const lprContentType = lPostRes.headers.get("Content-Type");
                          const lprIsJson = lprContentType && lprContentType.includes("application/json");
                    
                          const lprText = lprIsJson ? await lPostRes.json() : await lPostRes.text();
                          console.log("Raw lyric upload response:", lprText);
                          
                          if (lprIsJson && lprText.message === "Data Created Sucessfully")
                          console.log(lyrText.message);
                          console.log("Lyrics uploaded successfully");

                          try {
                            const odResponse = await fetch(`${BASE_URL}/data/listExclusion`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ 
                                "song": song, 
                                "artist": artist
                              }),
                            });
                            const odText = await odResponse.json();
                            setOtherData(odText);
                            console.log(odText);
                            console.log(otherData);
                            for (let i = 0; i < odText.length; i++) {
                              try {
                                const simResponse = await fetch("https://api.api-ninjas.com/v1/textsimilarity", {
                                  method: "POST",
                                  headers: {
                                    "X-Api-Key": "gcSOweST4vXedgtN26Z3xg==Guqol9FxgYHuKUBT"
                                  },
                                  //Uses the lyrics for both songs, if we implement a stripped version of the lyrics data you would swap those in here
                                  body: JSON.stringify({
                                    "text_1": lyrics,
                                    "text_2": odText[i].lyrics
                                  })
                                });
                                const simText = await simResponse.json();
                                console.log(simText);

                                try {
                                  const createSimResponse = await fetch(`${BASE_URL}/data/createSim`, {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json"
                                    }, 
                                    body: JSON.stringify({
                                      "song1": song,
                                      "artist1": artist,
                                      "song2": odText[i].song,
                                      "artist2": odText[i].artist,
                                      "similarity": Math.round(simText.similarity * 100)
                                    })
                                  });
                                  const createSimText = await createSimResponse.json();
                                  console.log(createSimText);
                                } catch (error) {
                                  console.error("Error uploading sim data: ", error);
                                }
                              } catch (error) {
                                console.error("Error creating similarity data for " + song + ", " + artist + " and " + odText[i].song + ", " + odText[i].artist + ": " + error);
                              }
                            }
                          } catch (error) {
                            console.error("Error fetching other data:", error);
                          } 

                          


                        }
                      } catch (err) {
                        console.log("Lyric Upload Error: ", err);
                      }
                    } else {
                      console.log("Couldn't find lyrics");
                    }

                  }

                } catch(err) {
                  console.log("Error Finding Lyrics", err);
                }

                Alert.alert("Rating created!");
              } else {
                Alert.alert("Rating creation failed: ", text.message || "Please try again.");
              }
            } else {
              Alert.alert("Registration Possibly Worked", "Check server — response was not JSON.");
            }

    } catch (err) {
      console.error("Error creating rating:", err);
      Alert.alert("Failed to create rating.");
    }
  };
  //Should look like a couple of text inputs and a submit button, each input is a different field for the rating
  //No fields can be empty - rating must be a digit 0-9.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Rating</Text>
      <Text>Song Title:</Text>
      <TextInput
        placeholder="Song Title"
        value={song}
        onChangeText={setSong}
        style={styles.input}
      />
      <Text>Artist Name:</Text>
      <TextInput
        placeholder="Artist"
        value={artist}
        onChangeText={setArtist}
        style={styles.input}
      />
      <Text>Rating:</Text>
      <TextInput
        placeholder="Rating (0-9)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        style={styles.input}
        maxLength={1}
      />
      <Button title="Submit Rating" onPress={createRating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
});
