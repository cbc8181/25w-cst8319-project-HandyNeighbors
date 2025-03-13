import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { ThemedButton } from '../components/ThemedButton';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_PREFIX } from '../config/api';
import { router } from 'expo-router';

const apiClient = axios.create({
  baseURL: API_PREFIX,
});

export default function DebugScreen() {
  const { logout } = useAuth();
  const [authState, setAuthState] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 加载本地认证状态
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');

      const authData = {
        token: token,
        user: user ? JSON.parse(user) : null,
        isAuthenticated: !!token && !!user,
      };

      setAuthState(authData);

      // 尝试API连接测试
      try {
        await checkApiConnection();
      } catch (err) {
        setApiStatus('API Server is not reachable');
      }

      // 如果有认证令牌，尝试获取用户列表
      if (token) {
        try {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await apiClient.get('/users');
          if (response.data && Array.isArray(response.data)) {
            setUsers(response.data);
          }
        } catch (apiError: any) {
          console.error('API Error:', apiError.message);
          // API调用失败，使用本地存储的用户
          const usersJson = await AsyncStorage.getItem('users');
          if (usersJson) {
            setUsers(JSON.parse(usersJson));
          }
        }
      } else {
        // 无令牌，使用本地存储的用户
        const usersJson = await AsyncStorage.getItem('users');
        if (usersJson) {
          setUsers(JSON.parse(usersJson));
        }
      }
    } catch (err) {
      console.error('Debug data loading error:', err);
      setError('Failed to load debug data');
    } finally {
      setLoading(false);
    }
  };

  const checkApiConnection = async () => {
    try {
      const response = await apiClient.get('/ping', { timeout: 3000 });
      setApiStatus(response.data?.message || 'API Connected');
      return true;
    } catch (error) {
      console.error('API Connection error:', error);
      setApiStatus('API Server is down or not reachable');
      return false;
    }
  };

  const clearAllData = async () => {
    try {
      Alert.alert(
        'Clear Data',
        'This will clear all stored data and log you out. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              await AsyncStorage.clear();
              setUsers([]);
              setAuthState({
                token: null,
                user: null,
                isAuthenticated: false,
              });
              await logout();
              setLoading(false);
              Alert.alert('Success', 'All data has been cleared');
            },
          },
        ]
      );
    } catch (err) {
      console.error('Error clearing data:', err);
      Alert.alert('Error', 'Failed to clear data');
    }
  };

  const createTestUser = async () => {
    try {
      setLoading(true);
      const testUser = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        user_type: 'community',
        postal_code: '12345',
      };

      const usersJson = await AsyncStorage.getItem('users');
      let users = usersJson ? JSON.parse(usersJson) : [];

      // 检查邮箱是否已存在
      const existingUserIndex = users.findIndex((u: any) => u.email === testUser.email);
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = { ...users[existingUserIndex], ...testUser, id: users[existingUserIndex].id };
      } else {
        users.push({ ...testUser, id: Date.now() });
      }

      await AsyncStorage.setItem('users', JSON.stringify(users));
      setUsers(users);
      setLoading(false);
      Alert.alert('Success', 'Test user created or updated');
    } catch (err) {
      console.error('Error creating test user:', err);
      setLoading(false);
      Alert.alert('Error', 'Failed to create test user');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading debug data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.title}>Debug Information</ThemedText>

        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>API Status</ThemedText>
          <ThemedText style={[
            styles.apiStatus,
            apiStatus?.includes('not') ? styles.apiStatusError : styles.apiStatusSuccess
          ]}>
            {apiStatus || 'Unknown'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Authentication State</ThemedText>
          <View style={styles.dataContainer}>
            <ThemedText style={styles.label}>Authenticated:</ThemedText>
            <ThemedText style={styles.value}>
              {authState?.isAuthenticated ? 'Yes' : 'No'}
            </ThemedText>
          </View>

          {authState?.token && (
            <View style={styles.dataContainer}>
              <ThemedText style={styles.label}>Token:</ThemedText>
              <ThemedText style={styles.value} numberOfLines={1} ellipsizeMode="middle">
                {authState.token}
              </ThemedText>
            </View>
          )}

          {authState?.user && (
            <>
              <ThemedText style={styles.subTitle}>Current User</ThemedText>
              <View style={styles.userCard}>
                {Object.entries(authState.user).map(([key, value]: [string, any]) => (
                  <View key={key} style={styles.dataContainer}>
                    <ThemedText style={styles.label}>{key}:</ThemedText>
                    <ThemedText style={styles.value}>
                      {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Stored Users</ThemedText>
          {users.length > 0 ? (
            users.map((user, index) => (
              <View key={index} style={styles.userCard}>
                <ThemedText style={styles.subTitle}>User {index + 1}</ThemedText>
                {Object.entries(user).map(([key, value]: [string, any]) => (
                  <View key={key} style={styles.dataContainer}>
                    <ThemedText style={styles.label}>{key}:</ThemedText>
                    <ThemedText style={styles.value}>
                      {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ))
          ) : (
            <ThemedText style={styles.noDataText}>No users found in storage</ThemedText>
          )}
        </ThemedView>

        <View style={styles.buttonContainer}>
          <ThemedButton title="Refresh Data" onPress={loadData} style={styles.button} />
          <ThemedButton title="Create Test User" onPress={createTestUser} style={styles.button} />
          <ThemedButton title="Clear All Data" onPress={clearAllData} style={styles.deleteButton} />
          <ThemedButton title="Return to Login" onPress={() => router.push('/signin')} style={styles.button} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    margin: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  apiStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8,
  },
  apiStatusSuccess: {
    color: 'green',
  },
  apiStatusError: {
    color: 'red',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dataContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    flex: 1,
  },
  value: {
    flex: 2,
  },
  noDataText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#888',
    marginVertical: 12,
  },
  buttonContainer: {
    marginTop: 16,
    gap: 10,
  },
  button: {
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    marginBottom: 10,
  },
}); 