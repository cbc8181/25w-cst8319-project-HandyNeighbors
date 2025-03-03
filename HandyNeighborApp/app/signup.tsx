import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiClient } from '@/services/api';
import { AUTH_ENDPOINTS } from '@/config/api';

type UserType = 'student' | 'community';

export default function SignUpScreen() {
  const [userType, setUserType] = useState<UserType>('student');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    postal_code: '',
    student_id: '',
  });

  const handleSignUp = async () => {
    try {
      // Validate required fields
      if (!formData.full_name || !formData.email || !formData.password) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);

      // Log the request data
      console.log('Attempting registration with:', {
        ...formData,
        user_type: userType,
        password: '***hidden***'
      });

      // Check if the server is reachable with a quick test call
      try {
        const response = await fetch('http://localhost:3000/api/test');
        if (!response.ok) {
          throw new Error('Server test failed');
        }
        console.log('Server test successful');
      } catch (serverError) {
        console.error('Server connection test failed:', serverError);
        Alert.alert(
          'Server Connection Error',
          'Cannot connect to the server. Please check that the server is running on localhost:3000.'
        );
        setLoading(false);
        return;
      }

      const { data, error } = await apiClient.post(AUTH_ENDPOINTS.register, {
        ...formData,
        user_type: userType,
      });

      if (error) {
        Alert.alert('Registration Failed', error);
        console.error('Registration error:', error);
        return;
      }

      if (data) {
        console.log('Registration successful:', data);
        Alert.alert(
          'Success!',
          'Your account has been created. Please sign in.',
          [{ text: 'OK', onPress: () => router.replace('/signin') }]
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'An unexpected error occurred. Please check server connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Logo and Title */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* <Image 
            source={require('@/assets/images/logo-icon.png')} 
            style={styles.logoIcon} 
          /> */}
          <ThemedText style={styles.logoText}>HandyNeighbor</ThemedText>
        </View>
        <ThemedText style={styles.title}>Sign Up</ThemedText>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={formData.full_name}
          onChangeText={(text) => setFormData({ ...formData, full_name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Postal Code"
          placeholderTextColor="#999"
          value={formData.postal_code}
          onChangeText={(text) => setFormData({ ...formData, postal_code: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Student ID"
          placeholderTextColor="#999"
          value={formData.student_id}
          onChangeText={(text) => setFormData({ ...formData, student_id: text })}
        />

        {/* Radio Buttons */}
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioButton} 
            onPress={() => setUserType('student')}
          >
            <View style={styles.radio}>
              {userType === 'student' && <View style={styles.radioInner} />}
            </View>
            <ThemedText style={styles.radioLabel}>Student</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioButton} 
            onPress={() => setUserType('community')}
          >
            <View style={styles.radio}>
              {userType === 'community' && <View style={styles.radioInner} />}
            </View>
            <ThemedText style={styles.radioLabel}>Community</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.signUpButton, loading && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.signUpButtonText}>Sign Up</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
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
  radioGroup: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 24,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  radioLabel: {
    fontSize: 16,
    color: '#000000',
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 