import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '@/components/BottomNavigation';
import TaskCard from '@/components/TaskCard';
import { useAuth } from '@/contexts/AuthContext';
import useTasks from '@/hooks/useTasks';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function SearchScreen() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { loading, tasks, filteredTasks, fetchTasks } = useTasks({
    initialSearchTerm: searchTerm,
  });

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const card = useThemeColor({}, 'card');
  const icon = useThemeColor({}, 'icon');
  const border = useThemeColor({}, 'border');

  const handleSearch = (text: string) => {
    setSearchTerm(text);
  };

  const handleTaskPress = (taskId: number) => {
    router.push(`/tasks/${taskId}`);
  };

  return (
      <ThemedView style={[styles.container, { backgroundColor: background }]}>
        <View style={[styles.header, { backgroundColor: card }]}>
          <ThemedText style={[styles.title, { color: text }]}>Search Tasks</ThemedText>
          <View style={[styles.searchContainer, { backgroundColor: border }]}>
            <Ionicons name="search" size={20} color={icon} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { color: text }]}
                placeholder="Search for tasks, location, or category..."
                placeholderTextColor={icon}
                value={searchTerm}
                onChangeText={handleSearch}
                autoFocus
            />
            {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={20} color={icon} />
                </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.resultsContainer}>
          {loading ? (
              <ActivityIndicator size="large" color={icon} style={styles.loader} />
          ) : filteredTasks.length > 0 ? (
              <FlatList
                  data={filteredTasks}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                      <TaskCard task={item} onPress={() => handleTaskPress(item.id)} />
                  )}
                  contentContainerStyle={styles.resultsList}
                  showsVerticalScrollIndicator={false}
              />
          ) : searchTerm ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="search-outline" size={48} color={icon} />
                <ThemedText style={[styles.noResultsText, { color: text }]}>
                  No tasks found for "{searchTerm}"
                </ThemedText>
                <ThemedText style={[styles.suggestionsText, { color: icon }]}>
                  Try searching with different keywords or categories.
                </ThemedText>
              </View>
          ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="search-outline" size={48} color={icon} />
                <ThemedText style={[styles.noResultsText, { color: text }]}>
                  Enter a search term
                </ThemedText>
                <ThemedText style={[styles.suggestionsText, { color: icon }]}>
                  Find tasks by location, category, or keywords.
                </ThemedText>
              </View>
          )}
        </View>

        <BottomNavigation />
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsList: {
    paddingBottom: 20,
  },
  loader: {
    marginTop: 50,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  suggestionsText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});
