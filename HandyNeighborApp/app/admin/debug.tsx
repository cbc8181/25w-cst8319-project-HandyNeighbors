import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function DebugPage() {
  const { isAuthenticated, user, token } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Debug Information</ThemedText>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.sectionTitle}>Authentication Status:</ThemedText>
        <ThemedText style={styles.value}>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</ThemedText>

        <ThemedText style={styles.sectionTitle}>User Information:</ThemedText>
        {user ? (
          <>
            <ThemedText style={styles.label}>User ID: <ThemedText style={styles.value}>{user.id}</ThemedText></ThemedText>
            <ThemedText style={styles.label}>Email: <ThemedText style={styles.value}>{user.email}</ThemedText></ThemedText>
            <ThemedText style={styles.label}>Name: <ThemedText style={styles.value}>{user.full_name}</ThemedText></ThemedText>
            <ThemedText style={styles.label}>Type: <ThemedText style={styles.value}>{user.user_type}</ThemedText></ThemedText>
          </>
        ) : (
          <ThemedText style={styles.value}>No user data</ThemedText>
        )}

        <ThemedText style={styles.sectionTitle}>Token:</ThemedText>
        <ThemedText style={styles.value}>{token ? `${token.substring(0, 20)}...` : 'No token'}</ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/welcome')}
        >
          <ThemedText style={styles.buttonText}>Go to Welcome</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/admin/dashboard')}
        >
          <ThemedText style={styles.buttonText}>Go to Dashboard</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginVertical: 4,
  },
  value: {
    fontSize: 16,
    color: '#666666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 