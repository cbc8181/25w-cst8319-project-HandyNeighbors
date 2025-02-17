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
import { useAuth } from '@/contexts/AuthContext'; // Adjust import to your Auth context path
import { apiClient } from '@/services/api';       // Adjust import to your API client path
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
  const { user } = useAuth(); // If you have user info in context
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
      const response = await apiClient.get('/tasks');
      // Example: response.data might be an array of tasks
      setTasks(response.data);
      // For demonstration, let's assume "nearby tasks" is just the first 5
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

  // Category data for icons
  const categories = [
    { id: '1', name: 'Gardening', icon: require('@/assets/icons/gardening.png') },
    { id: '2', name: 'Cleaning', icon: require('@/assets/icons/cleaning.png') },
    { id: '3', name: 'Repairs', icon: require('@/assets/icons/repairs.png') },
    { id: '4', name: 'Tutoring', icon: require('@/assets/icons/tutoring.png') },
    // Add more categories as needed
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Greeting */}
        <View style={styles.headerContainer}>
          <View>
            <ThemedText style={styles.headerTitle}>Find tasks and opportunities</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {user?.full_name ? `Welcome, ${user.full_name}` : 'Welcome!'}
            </ThemedText>
          </View>
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
            <Text style={styles.searchButtonText}>Search</Text>
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
                    source={require('@/assets/images/task_placeholder.png')}
                    style={styles.nearbyImage}
                  />
                  <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyTitle}>{item.title}</Text>
                    <Text style={styles.nearbyLocation}>{item.location}</Text>
                    <Text style={styles.nearbyPayment}>${item.payment} total</Text>
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
                <Text style={styles.categoryLabel}>{cat.name}</Text>
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
            <Text style={styles.noResultsText}>No tasks found.</Text>
          ) : (
            filteredTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskLocation}>{task.location}</Text>
                <Text style={styles.taskPayment}>${task.payment}</Text>
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
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFF',
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
  // Around You
  nearbyCard: {
    width: width * 0.6,
    marginRight: 10,
    backgroundColor: '#FFF',
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
  // Categories
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: 70,
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
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
  // All Tasks
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
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
