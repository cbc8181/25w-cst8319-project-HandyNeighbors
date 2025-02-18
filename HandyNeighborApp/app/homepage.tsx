import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const { width } = Dimensions.get('window');

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  payment: number;
  category: string;
  created_at: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await apiClient.get('/tasks'); // Ensure this matches your backend endpoint
      setTasks(response.data);
      // For demonstration, assume "nearby tasks" is the first 5 tasks
      setNearbyTasks(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks by search term (title or location)
  const filteredTasks = tasks.filter((task) => {
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      task.location.toLowerCase().includes(term)
    );
  });

  // Category data with images from assets/images
  const categories = [
    { id: '1', name: 'Gardening', icon: require('../assets/images/lawning.jpg') },
    { id: '2', name: 'Cleaning', icon: require('../assets/images/carcleaning.jpg') },
    { id: '3', name: 'Repairs', icon: require('../assets/images/tool.jpg') },
    { id: '4', name: 'Tutoring', icon: require('../assets/images/task.jpg') },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* User Dashboard Section */}
        <View style={styles.dashboard}>
          <ThemedText style={styles.greeting}>Welcome, {user?.full_name || 'User'}</ThemedText>
          <ThemedText style={styles.email}>{user?.email}</ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Enter location or task"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.searchButton}>
            <ThemedText style={styles.searchButtonText}>Search</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Around You Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Around you</ThemedText>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={nearbyTasks}
              horizontal
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.nearbyCard}>
                  <Image
                    source={require('../assets/images/delivery.jpg')}
                    style={styles.nearbyImage}
                  />
                  <View style={styles.nearbyInfo}>
                    <ThemedText style={styles.nearbyTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.nearbyLocation}>{item.location}</ThemedText>
                    <ThemedText style={styles.nearbyPayment}>${item.payment} total</ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <Image source={cat.icon} style={styles.categoryIcon} />
                <ThemedText style={styles.categoryLabel}>{cat.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Task Listing (Filtered by search) */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>All Tasks</ThemedText>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
          ) : filteredTasks.length === 0 ? (
            <ThemedText style={styles.noResultsText}>No tasks found.</ThemedText>
          ) : (
            filteredTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
                <ThemedText style={styles.taskLocation}>{task.location}</ThemedText>
                <ThemedText style={styles.taskPayment}>${task.payment}</ThemedText>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  dashboard: {
    marginTop: 40,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  // Around You Section
  nearbyCard: {
    width: width * 0.6,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  nearbyImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#CCC',
  },
  nearbyInfo: {
    padding: 10,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  nearbyLocation: {
    fontSize: 14,
    color: '#666',
  },
  nearbyPayment: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
  // Categories Section
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: 70,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 10,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  // All Tasks Section
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
  },
  taskPayment: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
