import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import BASE_URL from "../../constants/api";
import { useAuth } from "../../context/AuthContext";


export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmedPassword] = useState("");
  const { login } = useAuth(); // Get the login function from context
  

  const handleRegister = async () => {
    // Validation
    if (!username || !password || !confirm_password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirm_password) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      // Send registration request
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          "username" : username, 
          "password" : password, 
          "confirm_password" : confirm_password}), // Include confirmed_password
      });

      console.log("Response Status:", response.status); // Debugging log

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      const isJson = contentType && contentType.includes("application/json");

      const text = isJson ? await response.json() : await response.text();
      console.log("Raw registration response:", text);

      if (isJson) {
        if (text.message === "User registered successfully") {
          Alert.alert("Success", "User registered!");
          login({ username, message: text.message }); // Save user data in context (no token available in response)

          console.log(text);
        } else {
          Alert.alert("Registration Failed", text.message || "Please try again.");
        }
      } else {
        Alert.alert("Registration Possibly Worked", "Check server — response was not JSON.");
      }
    } catch (err) {
      console.error("Register error:", err);
      Alert.alert("Error", "Failed to register.");
    }

    /*fetch(`http://172.21.220.168:8080/index.php/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
        "confirm_password": confirm_password,
      })
    }).then(res => {console.log("Result: " + res)}).catch(err => console.log("Error: " + err))*/
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={text => setUsername(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={text => setPassword(text)}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirm_password}
        onChangeText={text => setConfirmedPassword(text)}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Register" onPress={handleRegister} />
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
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
});
