import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import BASE_URL from "../../constants/api"; // Your API base URL
import { useNavigation } from "@react-navigation/native"; // For navigation

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // Get the login function from context
  const navigation = useNavigation(); // For navigating after successful login

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("Response Status:", response.status); // Log the status code
      const text = await response.text();  // Get raw text from response
      console.log("Raw Response:", text);  // Log raw response

      try {
        const data = JSON.parse(text);
        console.log("Parsed Response Data:", data); // Log parsed data for debugging
        
        if (data.message === "Login successful") {
          // If the server responds with a success message, treat it as a successful login
          Alert.alert("Login Success", `Welcome back, ${data.username || username}!`);
          login({ username, message: data.message }); // Save user data in context (no token available in response)
        } else {
          // If login was not successful, show error
          Alert.alert("Login Failed", "Invalid credentials. Please try again.");
        }
      } catch (err) {
        console.error("Error parsing response:", err);
        Alert.alert("Server Error", "Could not parse server response.");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Error", "Login failed. Please check your credentials.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text style={styles.linkText} onPress={() => navigation.navigate("register")}>
        Don't have an account? Register here.
      </Text>
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
  linkText: {
    color: "blue",
    marginTop: 12,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
