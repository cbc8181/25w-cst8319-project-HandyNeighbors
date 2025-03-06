import React from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from '@/components/TaskCard';
import BottomNavigation from '@/components/BottomNavigation';
import CategorySelector from '@/components/CategorySelector';
import useTasks from '@/hooks/useTasks';

// Categories with better icon names and structure
const categories = [
  { id: 'gardening', name: 'Gardening', icon: 'leaf' },
  { id: 'cleaning', name: 'Cleaning', icon: 'water' },
  { id: 'repairs', name: 'Repairs', icon: 'hammer' },
  { id: 'tutoring', name: 'Tutoring', icon: 'school' },
  { id: 'delivery', name: 'Delivery', icon: 'bicycle' },
  { id: 'snow', name: 'Snow Removal', icon: 'snow' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { 
    loading, 
    error,
    nearbyTasks, 
    filteredTasks,
    searchTerm, 
    setSearchTerm,
    selectedCategory, 
    setSelectedCategory,
    fetchTasks
  } = useTasks();

  const handleTaskPress = (taskId: number) => {
    // Will be implemented to navigate to task details
    console.log(`Task ${taskId} pressed`);
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header with light blue-gray background */}
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <ThemedText style={styles.welcomeText}>Hello, {user?.full_name || 'Neighbor'}!</ThemedText>
            <ThemedText style={styles.subText}>Ready to find help?</ThemedText>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{user?.full_name?.charAt(0) || 'U'}</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for location or task..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Failed to load tasks. Please try again later.
          </ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <ThemedText style={styles.refreshButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Nearby Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Around You</ThemedText>
              <TouchableOpacity onPress={handleRefresh}>
                <Ionicons name="refresh" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
              {loading ? (
                <ActivityIndicator size="small" color="#000" style={styles.loader} />
              ) : (
                nearbyTasks.length === 0 ? (
                  <ThemedText style={styles.noTasksText}>No nearby tasks available.</ThemedText>
                ) : (
                  nearbyTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      compact 
                      onPress={() => handleTaskPress(task.id)} 
                    />
                  ))
                )
              )}
            </ScrollView>
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
            <CategorySelector 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </View>

          {/* All Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Available Tasks</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                {selectedCategory ? `Showing ${selectedCategory} tasks` : 'All tasks'}
              </ThemedText>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#000" style={styles.loader} />
            ) : (
              filteredTasks.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <ThemedText style={styles.noTasksText}>No tasks found. Try adjusting your filters.</ThemedText>
                </View>
              ) : (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onPress={() => handleTaskPress(task.id)} 
                  />
                ))
              )
            )}
          </View>
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  headerBackground: {
    width: '100%',
    backgroundColor: '#E6EEF2',
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  subText: {
    fontSize: 16,
    color: '#555555',
    marginTop: 4,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  horizontalList: {
    flexDirection: 'row',
  },
  loader: {
    marginVertical: 20,
  },
  noTasksText: {
    textAlign: 'center',
    color: '#666666',
    marginVertical: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginVertical: 10,
  },
}); 