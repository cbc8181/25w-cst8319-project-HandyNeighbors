import React from 'react';
import { StyleSheet, Image, View, Dimensions, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 200; 

export default function WelcomeScreen() {
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
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
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
  buttonWrapper: {
    // backgroundColor: 'green',
    height: 40,
    alignItems: 'center',
    width: '100%',
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
    shadowColor: '#000', // iOS 阴影
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
}); 