import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, Link } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedButton } from '../components/ThemedButton';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_PREFIX, AUTH_ENDPOINTS } from '../config/api';

// 创建API客户端
const apiClient = axios.create({
  baseURL: API_PREFIX,
});

// 定义登录响应类型
interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    user_type: string;
    postal_code?: string;
    student_id?: string;
    [key: string]: any;
  };
}

export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting to login with:', { email });

      // 调用登录API
      const response = await apiClient.post<LoginResponse>(
        AUTH_ENDPOINTS.login,
        { email, password }
      );

      console.log('Login response received');

      if (response.data && response.data.token && response.data.user) {
        console.log('Login successful for user:', response.data.user.email);

        // 使用AuthContext保存登录信息
        await login(response.data.token, response.data.user);
        console.log('Auth context updated, navigation should happen automatically');
      } else {
        setError('Invalid response from server');
        console.error('Login response missing token or user data');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // 获取API错误消息
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goToDebugPage = () => {
    router.push('/debug');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Sign In</ThemedText>

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Email</ThemedText>
          <ThemedTextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Password</ThemedText>
          <ThemedTextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        ) : (
          <ThemedButton
            title="Sign In"
            onPress={handleSignIn}
            style={styles.signInButton}
          />
        )}

        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <ThemedText style={styles.linkText}>Don't have an account? Sign Up</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.linkText}>Return to previous page</ThemedText>
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <TouchableOpacity onPress={goToDebugPage} style={styles.debugButton}>
            <ThemedText style={styles.debugText}>Debug</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  loader: {
    marginVertical: 20,
  },
  signInButton: {
    marginTop: 10,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#0a7ea4',
    fontSize: 16,
  },
  debugButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  debugText: {
    color: '#666666',
    fontSize: 14,
  }
}); 