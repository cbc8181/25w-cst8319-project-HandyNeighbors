import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

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

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon'); // fallback for border color
  const tint = useThemeColor({}, 'tint');

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

      const { data, error } = await apiClient.post('/tasks', requestData);

      if (error) {
        Alert.alert('Error', error.toString());
        return;
      }

      if (data) {
        router.replace('/home');
      }

    } catch (error: any) {
      Alert.alert('Error', `Failed to create task: ${error.message}`);
    }
  };

  return (
      <ThemedView style={[styles.container, { backgroundColor: background }]}>
        <ScrollView style={styles.form}>
          <TextInput
              style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
              placeholder="Task Title"
              placeholderTextColor={border}
              value={taskData.title}
              onChangeText={(text) => setTaskData({ ...taskData, title: text })}
              maxLength={255}
          />

          <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: card, borderColor: border, color: text }]}
              placeholder="Task Description"
              placeholderTextColor={border}
              multiline
              numberOfLines={4}
              value={taskData.description}
              onChangeText={(text) => setTaskData({ ...taskData, description: text })}
          />

          <TouchableOpacity
              style={[styles.input, { backgroundColor: card, borderColor: border }]}
              onPress={() => setShowCategories(!showCategories)}
          >
            <ThemedText style={{ color: taskData.category ? text : border }}>
              {taskData.category ? categories.find(c => c.id === taskData.category)?.label : 'Select a category'}
            </ThemedText>
          </TouchableOpacity>

          {showCategories && (
              <View style={[styles.dropdownList, { backgroundColor: card, borderColor: border }]}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.dropdownItem}
                        onPress={() => selectCategory(category.id)}
                    >
                      <ThemedText style={{ color: text }}>{category.label}</ThemedText>
                    </TouchableOpacity>
                ))}
              </View>
          )}

          <TextInput
              style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
              placeholder="Postal Code"
              placeholderTextColor={border}
              value={taskData.postal_code}
              onChangeText={(text) => setTaskData({ ...taskData, postal_code: text })}
              maxLength={10}
          />

          <TextInput
              style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
              placeholder="Budget"
              placeholderTextColor={border}
              keyboardType="decimal-pad"
              value={taskData.budget}
              onChangeText={(text) => setTaskData({ ...taskData, budget: text })}
          />

          <TouchableOpacity
              style={[styles.createButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleCreateTask}
          >
            <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Create Task</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    justifyContent: 'center',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: -12,
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  createButton: {
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
