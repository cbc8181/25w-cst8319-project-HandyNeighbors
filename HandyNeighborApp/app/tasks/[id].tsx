import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiClient } from '@/services/api';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const { data, error } = await apiClient.get(`/tasks/${id}`);
      if (error) throw error;
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const { error } = await apiClient.post(`/tasks/${id}/applications`);
      if (error) throw error;
      Alert.alert('Success', 'Application submitted successfully');
    } catch (error) {
      console.error('Error applying for task:', error);
      Alert.alert('Error', 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedText style={styles.title}>{task?.title}</ThemedText>
        <ThemedText style={styles.category}>{task?.category}</ThemedText>
        <ThemedText style={styles.description}>{task?.description}</ThemedText>

        <ThemedView style={styles.detailsContainer}>
          <ThemedText style={styles.detailLabel}>Location:</ThemedText>
          <ThemedText style={styles.detailValue}>{task?.location}</ThemedText>

          <ThemedText style={styles.detailLabel}>Budget:</ThemedText>
          <ThemedText style={styles.detailValue}>${task?.budget}</ThemedText>

          <ThemedText style={styles.detailLabel}>Status:</ThemedText>
          <ThemedText style={styles.detailValue}>{task?.status}</ThemedText>
        </ThemedView>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <ThemedText style={styles.applyButtonText}>Apply for Task</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 