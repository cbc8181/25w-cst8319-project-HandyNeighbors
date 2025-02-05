import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Welcome to Home</ThemedText>
      <View style={styles.content}>
        <Text style={styles.text}>This is the home page of HandyNeighborApp.</Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
}); 