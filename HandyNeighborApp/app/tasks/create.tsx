import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categories = [
  { id: '', label: 'Select a category' },
  { id: 'gardening', label: 'Gardening' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'repairs', label: 'Repairs' },
  { id: 'tutoring', label: 'Tutoring' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'snow', label: 'Snow Removal' },
];

export default function CreateTaskScreen() {
  const { user } = useAuth();

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    postal_code: '',
    location: '',
    budget: '',
    category: '',
  });

  const [showCategories, setShowCategories] = useState(false);

  const selectCategory = (categoryId: string) => {
    setTaskData({ ...taskData, category: categoryId });
    setShowCategories(false);
  };

  const handleCreateTask = async () => {
    try {
      if (!taskData.title || !taskData.description || !taskData.postal_code || !taskData.category) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const requestData = {
        title: taskData.title,
        description: taskData.description,
        creator_id: user?.id,
        status: 'open',
        postal_code: taskData.postal_code,
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        reward: parseFloat(taskData.budget) || 0,
        category: taskData.category
      };

      console.log('Sending task data:', JSON.stringify(requestData, null, 2));

      const { data, error } = await apiClient.post('/tasks', requestData);

      if (error) {
        console.error('Create task error:', error);
        Alert.alert('Error', error.toString());
        return;
      }

      if (data) {
        router.replace('/home');
      }

    } catch (error: any) {
      console.error('Create task error:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Failed to create task: ${error.message}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Task Title"
          value={taskData.title}
          onChangeText={(text) => setTaskData({ ...taskData, title: text })}
          maxLength={255}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Task Description"
          multiline
          numberOfLines={4}
          value={taskData.description}
          onChangeText={(text) => setTaskData({ ...taskData, description: text })}
        />

        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowCategories(!showCategories)}
        >
          <ThemedText>
            {taskData.category ?
              categories.find(c => c.id === taskData.category)?.label :
              'Select a category'}
          </ThemedText>
        </TouchableOpacity>

        {showCategories && (
          <View style={styles.dropdownList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.dropdownItem}
                onPress={() => selectCategory(category.id)}
              >
                <ThemedText>{category.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Postal Code"
          value={taskData.postal_code}
          onChangeText={(text) => setTaskData({ ...taskData, postal_code: text })}
          maxLength={10}
        />

        <TextInput
          style={styles.input}
          placeholder="Budget"
          keyboardType="decimal-pad"
          value={taskData.budget}
          onChangeText={(text) => setTaskData({ ...taskData, budget: text })}
        />

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTask}
        >
          <ThemedText style={styles.buttonText}>Create Task</ThemedText>
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
  form: {
    padding: 20,
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
    justifyContent: 'center',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginTop: -12,
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});