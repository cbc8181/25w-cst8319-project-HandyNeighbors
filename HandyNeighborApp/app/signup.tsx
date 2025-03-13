import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedText } from '../components/ThemedText';
import { ThemedButton } from '../components/ThemedButton';
import { ThemedView } from '../components/ThemedView';
import { router } from 'expo-router';
import axios from 'axios';
import { API_PREFIX, AUTH_ENDPOINTS } from '../config/api';

// 创建API客户端
const apiClient = axios.create({
  baseURL: API_PREFIX,
});

export default function SignUp() {
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

    // 表单验证
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

    // 创建注册数据
    const userData = {
      full_name: fullName,
      email: email,
      password: password,
      user_type: userType,
      postal_code: postalCode,
      ...(userType === 'student' && { student_id: studentId }),
    };

    try {
      // 通过API发送注册请求
      const response = await apiClient.post(AUTH_ENDPOINTS.register, userData);

      console.log('Registration response:', response.data);
      setRegistrationSuccess(true);

      // 显示成功消息
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please log in.',
        [{ text: 'OK', onPress: () => router.replace('/signin') }]
      );
    } catch (error: any) {
      console.error('Registration error:', error);

      // 获取API错误消息
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 当注册成功时自动导航到登录页面
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
          <ThemedTextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Email *</ThemedText>
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
          <ThemedText style={styles.inputLabel}>Password *</ThemedText>
          <ThemedTextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Confirm Password *</ThemedText>
          <ThemedTextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Postal Code</ThemedText>
          <ThemedTextInput
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="Postal Code"
            style={styles.input}
          />
        </View>

        <View style={styles.userTypeContainer}>
          <ThemedText style={styles.userTypeLabel}>User Type *</ThemedText>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'student' && styles.selectedUserType
              ]}
              onPress={() => setUserType('student')}
            >
              <ThemedText
                style={[
                  styles.userTypeButtonText,
                  userType === 'student' && styles.selectedUserTypeText
                ]}
              >
                Student
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'community' && styles.selectedUserType
              ]}
              onPress={() => setUserType('community')}
            >
              <ThemedText
                style={[
                  styles.userTypeButtonText,
                  userType === 'community' && styles.selectedUserTypeText
                ]}
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
              style={styles.input}
            />
          </View>
        )}

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        {isLoading ? (
          <ActivityIndicator size="large" color="#0a7ea4" />
        ) : (
          <ThemedButton title="Sign Up" onPress={handleSignUp} style={styles.button} />
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <ThemedText style={styles.backText}>Return to previous page</ThemedText>
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
  input: {
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
    borderColor: '#CCCCCC',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedUserType: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  userTypeButtonText: {
    color: '#11181C',
  },
  selectedUserTypeText: {
    color: 'white',
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
  backText: {
    color: '#0a7ea4',
    fontSize: 16,
  },
}); 