import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiClient } from '@/services/api';
import { AUTH_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

// define login response type
interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    user_type: string;
  };
}

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.login, { 
      email, 
      password 
    });

    if (response.error) {
      Alert.alert('Error', 'Email address and password do not match.');
      return;
    }

    if (response.data) {
      await login(response.data.token, response.data.user);
      router.replace('/home');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Sign In</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  signInButton: {
    backgroundColor: '#000000',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 