import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  useColorScheme,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from '@/components/TaskCard';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import BottomNavigation from '@/components/BottomNavigation'

interface Task {
  id: number;
  title: string;
  description: string;
  creator_id: number;
  helper_id: number | null;
  status: string;
  postal_code: string;
  location: string;
  reward: number;
  category: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export default function TaskManagementScreen() {
  const { user } = useAuth();
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'created' | 'assigned'>('created');
  const colorScheme = useColorScheme();

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: createdData, error: createdError } = await apiClient.get<Task[]>(`/tasks?creator_id=${user?.id}`);
      if (createdError) {
        setError('Failed to load your created tasks');
        return;
      }

      const { data: assignedData, error: assignedError } = await apiClient.get<Task[]>(`/tasks?helper_id=${user?.id}`);
      if (assignedError) {
        setError('Failed to load your assigned tasks');
        return;
      }

      setCreatedTasks(createdData || []);
      const acceptedTasks = (assignedData || []).filter(task =>
          ['assigned', 'completed', 'cancelled'].includes(task.status)
      );
      setAssignedTasks(acceptedTasks);
    } catch (err) {
      setError('An error occurred while loading tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdated = (taskId: number, newStatus: string) => {
    setCreatedTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setAssignedTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  useEffect(() => {
    fetchUserTasks();
  }, [user?.id]);

  const renderTaskList = (tasks: Task[]) => {
    if (tasks.length === 0) {
      return (
          <View style={[styles.emptyContainer, { backgroundColor: background }]}>
            <Ionicons name="document-outline" size={48} color={icon} />
            <ThemedText style={[styles.emptyText, { color: icon }]}>
              {activeTab === 'created'
                  ? "You haven't created any tasks yet"
                  : "You don't have any assigned tasks"}
            </ThemedText>


            {activeTab === 'created' ? (
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: tint }]}
                    onPress={() => router.push('/tasks/create')}
                >
                  <ThemedText style={styles.createButtonText}>Create a Task</ThemedText>
                </TouchableOpacity>
            ) : (
                <ThemedText style={[styles.hintText, { color: icon }]}>              Tasks will appear here after you accept them from the home page
                </ThemedText>
            )}
          </View>
      );
    }

    return (
        <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <TaskCard
                    task={{
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      location: item.postal_code,
                      reward: item.reward,
                      category: item.category,
                      status: item.status,
                      creator_id: item.creator_id,
                      helper_id: item.helper_id || undefined,
                      created_at: item.created_at,
                      user_id: item.creator_id,
                    }}
                    showStatusControls={false}
                    onStatusUpdated={handleTaskStatusUpdated}
                />
            )}
            contentContainerStyle={styles.listContent}
        />
    );
  };

  const activeTabTextColor = colorScheme === 'dark' ? text : background;

  return (
      <ThemedView style={[styles.container, { backgroundColor: background }]}>
        <View style={[styles.header, { backgroundColor: card }]}>
          <ThemedText style={[styles.title, { color: text }]}>Manage Tasks</ThemedText>
        <TouchableOpacity onPress={fetchUserTasks}>
          <Ionicons name="refresh" size={24} color={text} />
        </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
              style={[styles.tab, { backgroundColor: activeTab === 'created' ? tint : card }]}
              onPress={() => setActiveTab('created')}
          >
            <ThemedText style={[styles.tabText, { color: activeTab === 'created' ? activeTabTextColor : text }]}>            Created
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.tab, { backgroundColor: activeTab === 'assigned' ? tint : card }]}
              onPress={() => setActiveTab('assigned')}
          >
            <ThemedText style={[styles.tabText, { color: activeTab === 'assigned' ? activeTabTextColor : text }]}>            Assigned to Me
            </ThemedText>
          </TouchableOpacity>
        </View>

        {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tint} />
              <ThemedText style={[styles.loadingText, { color: icon }]}>Loading tasks...</ThemedText>
            </View>
        ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
              <ThemedText style={[styles.errorText, { color: '#F44336' }]}>{error}</ThemedText>
              <TouchableOpacity style={[styles.retryButton, { backgroundColor: tint }]} onPress={fetchUserTasks}>
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
        ) : (
            <View style={styles.content}>{activeTab === 'created' ? renderTaskList(createdTasks) : renderTaskList(assignedTasks)}</View>
        )}
        <BottomNavigation />
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: { fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  hintText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
});
