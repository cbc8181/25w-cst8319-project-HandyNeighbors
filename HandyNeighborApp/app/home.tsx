import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from '@/components/TaskCard';
import BottomNavigation from '@/components/BottomNavigation';
import CategorySelector from '@/components/CategorySelector';
import useTasks from '@/hooks/useTasks';
import { router } from 'expo-router';

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
    fetchTasks,
  } = useTasks();

  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'icon');


  const handleTaskPress = (taskId: number) => {
    router.push(`/tasks/${taskId}`);
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  return (
      <ThemedView style={[styles.container, { backgroundColor: background }]}>
        <View style={[styles.headerBackground, { backgroundColor: surface }]}>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <ThemedText style={[styles.welcomeText, { color: text }]}>Hello, {user?.full_name || 'Neighbor'}!</ThemedText>
              <ThemedText style={[styles.subText, { color: muted }]}>Ready to find help?</ThemedText>
            </View>
            <TouchableOpacity style={[styles.avatar, { backgroundColor: background }]}>
              <ThemedText style={[styles.avatarText, { color: text }]}>{user?.full_name?.charAt(0) || 'U'}</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: background }]}>
            <Ionicons name="search" size={20} color={muted} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { color: text }]}
                placeholder="Search for location or task..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor={muted}
            />
          </View>

          <TouchableOpacity style={styles.createTaskButton} onPress={() => router.push('/tasks/create')}>
            <Ionicons name="add" size={24} color="#FFF" />
            <ThemedText style={styles.createTaskButtonText}>Create Task</ThemedText>
          </TouchableOpacity>
        </View>

        {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>Failed to load tasks. Please try again later.</ThemedText>
              <TouchableOpacity style={[styles.refreshButton, { backgroundColor: muted }] } onPress={handleRefresh}>
                <ThemedText style={[styles.refreshButtonText, { color: background }]}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
        ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: text }]}>Around You</ThemedText>
                  <TouchableOpacity onPress={handleRefresh}>
                    <Ionicons name="refresh" size={20} color={text} />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                  {loading ? (
                      <ActivityIndicator size="small" color={text} style={styles.loader} />
                  ) : nearbyTasks.length === 0 ? (
                      <ThemedText style={[styles.noTasksText, { color: muted }]}>No nearby tasks available.</ThemedText>
                  ) : (
                      nearbyTasks.map(task => (
                          <TaskCard key={task.id} task={task} compact onPress={() => handleTaskPress(task.id)} />
                      ))
                  )}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: text }]}>Categories</ThemedText>
                <CategorySelector categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: text }]}>Available Tasks</ThemedText>
                  <ThemedText style={[styles.sectionSubtitle, { color: muted }]}>
                    {selectedCategory ? `Showing ${selectedCategory} tasks` : 'All tasks'}
                  </ThemedText>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color={text} style={styles.loader} />
                ) : filteredTasks.length === 0 ? (
                    <View style={[styles.emptyStateContainer, { backgroundColor: background }]}>
                      <Ionicons name="search-outline" size={48} color={muted} />
                      <ThemedText style={[styles.noTasksText, { color: muted }]}>No tasks found. Try adjusting your filters.</ThemedText>
                    </View>
                ) : (
                    filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} onPress={() => handleTaskPress(task.id)} />
                    ))
                )}
              </View>
            </ScrollView>
        )}

        <BottomNavigation />
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: { width: '100%', paddingBottom: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  userInfo: { flex: 1 },
  welcomeText: { fontSize: 22, fontWeight: 'bold' },
  subText: { fontSize: 16, marginTop: 4 },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  sectionSubtitle: { fontSize: 14 },
  horizontalList: { flexDirection: 'row' },
  loader: { marginVertical: 20 },
  noTasksText: { textAlign: 'center', marginVertical: 10 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#FF3B30', textAlign: 'center', marginBottom: 20 },
  refreshButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  refreshButtonText: { fontSize: 16, fontWeight: '600' },
  emptyStateContainer: { alignItems: 'center', padding: 30, borderRadius: 10, marginVertical: 10 },
  createTaskButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 24,
    marginTop: 16,
    marginHorizontal: 20,
  },
  createTaskButtonText: { color: '#FFF', marginLeft: 8, fontWeight: '600' },
});
