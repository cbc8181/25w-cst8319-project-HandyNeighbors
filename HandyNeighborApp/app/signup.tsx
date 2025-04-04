import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedText } from '../components/ThemedText';
import { ThemedButton } from '../components/ThemedButton';
import { ThemedView } from '../components/ThemedView';
import { router } from 'expo-router';
import axios from 'axios';
import { API_PREFIX, AUTH_ENDPOINTS } from '../config/api';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

const apiClient = axios.create({ baseURL: API_PREFIX });

export default function SignUp() {
  const { resolvedTheme } = useThemeContext();
  const themeColors = Colors[resolvedTheme];
  const isDark = resolvedTheme === 'dark';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [userType, setUserType] = useState('community');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSignUp = async () => {
    setError('');
    setIsLoading(true);

    if (!fullName || !email || !password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (userType === 'student' && !studentId) {
      setError('Student ID is required for student accounts');
      setIsLoading(false);
      return;
    }

    const userData = {
      full_name: fullName,
      email,
      password,
      user_type: userType,
      postal_code: postalCode,
      ...(userType === 'student' && { student_id: studentId }),
    };

    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.register, userData);
      console.log('Registration response:', response.data);
      setRegistrationSuccess(true);
      Alert.alert('Registration Successful', 'Your account has been created. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/signin') },
      ]);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        router.replace('/signin');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess]);

  return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>Sign Up</ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Full Name *</ThemedText>
            <ThemedTextInput value={fullName} onChangeText={setFullName} placeholder="Full Name" />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Email *</ThemedText>
            <ThemedTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Password *</ThemedText>
            <ThemedTextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Confirm Password *</ThemedText>
            <ThemedTextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Postal Code</ThemedText>
            <ThemedTextInput value={postalCode} onChangeText={setPostalCode} placeholder="Postal Code" />
          </View>

          <View style={styles.userTypeContainer}>
            <ThemedText style={styles.userTypeLabel}>User Type *</ThemedText>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    {
                      borderColor: isDark ? '#555' : '#CCC',
                      backgroundColor: userType === 'student' ? '#0a7ea4' : 'transparent'
                    },
                  ]}
                  onPress={() => setUserType('student')}
              >
                <ThemedText
                    style={{
                      color: userType === 'student' ? '#FFF' : isDark ? '#ECEDEE' : '#111',
                      fontWeight: '500',
                    }}
                >
                  Student
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    {
                      borderColor: isDark ? '#555' : '#CCC',
                      backgroundColor: userType === 'community' ? '#0a7ea4' : 'transparent'
                    },
                  ]}
                  onPress={() => setUserType('community')}
              >
                <ThemedText
                    style={{
                      color: userType === 'community' ? '#FFF' : isDark ? '#ECEDEE' : '#111',
                      fontWeight: '500',
                    }}
                >
                  Community
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {userType === 'student' && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Student ID *</ThemedText>
                <ThemedTextInput
                    value={studentId}
                    onChangeText={setStudentId}
                    placeholder="Student ID"
                />
              </View>
          )}

          {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

          {isLoading ? (
              <ActivityIndicator size="large" color={themeColors.tint} />
          ) : (
              <ThemedButton title="Sign Up" onPress={handleSignUp} style={styles.button} />
          )}

          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <ThemedText style={{ color: themeColors.link, fontSize: 16 }}>
              Return to previous page
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  userTypeContainer: {
    marginVertical: 15,
  },
  userTypeLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userTypeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
  button: {
    marginTop: 20,
  },
  backLink: {
    marginTop: 15,
    alignItems: 'center',
  },
});
