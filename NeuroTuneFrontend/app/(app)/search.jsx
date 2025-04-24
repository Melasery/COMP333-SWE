// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleChange = text => {
    setQuery(text);
    // TODO: replace this with real DB search
    // onSearch(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search songs..."
        value={query}
        onChangeText={handleChange}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    height: 40,
    paddingHorizontal: 12,
  },
});