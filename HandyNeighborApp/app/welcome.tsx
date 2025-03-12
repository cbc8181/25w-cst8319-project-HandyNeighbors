import React, { useState } from 'react';
import { StyleSheet, Image, View, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AdminLoginModal } from '@/components/AdminLoginModal';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 200;

export default function WelcomeScreen() {
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>HandyNeighbor</ThemedText>
        <ThemedText style={styles.subtitle}>
          Find and accept tasks in your community
        </ThemedText>

        <Image
          source={require('@/assets/images/homepage.jpg')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.joinButton]}
          onPress={() => router.push('/signup')}
        >
          <ThemedText style={[styles.buttonText, styles.joinButtonText]}>Join</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signInButton]}
          onPress={() => router.push('/signin')}
        >
          <ThemedText style={[styles.buttonText, styles.signInButtonText]}>Sign In</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminLink}
          onPress={() => setAdminModalVisible(true)}
        >
          <ThemedText style={styles.adminLinkText}>Admin Login</ThemedText>
        </TouchableOpacity>
      </View>

      <AdminLoginModal
        visible={adminModalVisible}
        onClose={() => setAdminModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  image: {
    width: width * 0.8,
    height: IMAGE_HEIGHT,
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  button: {
    width: '100%',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  signInButton: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  joinButtonText: {
    color: '#ffffff',
  },
  signInButtonText: {
    color: '#ffffff',
  },
  adminLink: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  adminLinkText: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'underline',
  },
}); 