import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import TaskCard, { Task as TaskCardTask } from '@/components/TaskCard';
import { router } from 'expo-router';

// 后端任务类型
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

  // 获取用户创建和被分配的任务
  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取用户创建的任务
      const { data: createdData, error: createdError } = await apiClient.get<Task[]>('/tasks?creator_id=' + user?.id);

      if (createdError) {
        setError('Failed to load your created tasks');
        return;
      }

      // 获取分配给用户的任务
      const { data: assignedData, error: assignedError } = await apiClient.get<Task[]>('/tasks?helper_id=' + user?.id);

      if (assignedError) {
        setError('Failed to load your assigned tasks');
        return;
      }

      setCreatedTasks(createdData || []);

      // 只显示已经被接受的任务（状态为assigned、completed或cancelled）
      const acceptedTasks = (assignedData || []).filter(task =>
        task.status === 'assigned' || task.status === 'completed' || task.status === 'cancelled'
      );
      setAssignedTasks(acceptedTasks);
    } catch (err) {
      setError('An error occurred while loading tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理任务状态更新
  const handleTaskStatusUpdated = (taskId: number, newStatus: string) => {
    // 更新创建的任务列表
    setCreatedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    // 更新分配的任务列表
    setAssignedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  useEffect(() => {
    fetchUserTasks();
  }, [user?.id]);

  // 渲染任务列表
  const renderTaskList = (tasks: Task[]) => {
    if (tasks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color="#CCCCCC" />
          <ThemedText style={styles.emptyText}>
            {activeTab === 'created'
              ? "You haven't created any tasks yet"
              : "You don't have any assigned tasks"}
          </ThemedText>
          {activeTab === 'created' && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/tasks/create')}
            >
              <ThemedText style={styles.createButtonText}>Create a Task</ThemedText>
            </TouchableOpacity>
          )}
          {activeTab === 'assigned' && (
            <ThemedText style={styles.hintText}>
              Tasks will appear here after you accept them from the home page
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
              user_id: item.creator_id
            }}
            showStatusControls={true}
            onStatusUpdated={handleTaskStatusUpdated}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Manage Tasks</ThemedText>
        <TouchableOpacity onPress={fetchUserTasks}>
          <Ionicons name="refresh" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'created' && styles.activeTab]}
          onPress={() => setActiveTab('created')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
            Created
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
            Assigned to Me
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Loading tasks...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserTasks}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {activeTab === 'created' ? renderTaskList(createdTasks) : renderTaskList(assignedTasks)}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
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
    color: '#F44336',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
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
    color: '#666666',
  },
  hintText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: '#999999',
    paddingHorizontal: 20,
  },
  createButton: {
    backgroundColor: '#4CAF50',
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
  },
}); 