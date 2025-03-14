import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// 任务状态类型
type TaskStatus = 'open' | 'assigned' | 'completed' | 'cancelled';

// 任务类型定义
interface Task {
  id: number;
  title: string;
  description: string;
  creator_id: number;
  helper_id: number | null;
  status: TaskStatus;
  postal_code: string;
  reward: number;
  category: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  creator_name: string;
  helper_name: string | null;
}

// 任务状态标签颜色
const STATUS_COLORS: Record<TaskStatus, string> = {
  open: '#4CAF50',      // 绿色
  assigned: '#2196F3',  // 蓝色
  completed: '#9C27B0', // 紫色
  cancelled: '#F44336'  // 红色
};

// 任务状态中文名称
const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'open',
  assigned: 'assigned',
  completed: 'completed',
  cancelled: 'cancelled',
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // 获取任务详情
  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await apiClient.get<Task>(`/tasks/${id}`);

      if (error) {
        setError(typeof error === 'string' ? error : 'Failed to load task details');
        return;
      }

      if (data) {
        setTask(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  // 更新任务状态
  const updateTaskStatus = async (newStatus: TaskStatus) => {
    try {
      setUpdating(true);

      // 使用类型断言，因为我们知道apiClient应该有put方法
      const apiClientWithPut = apiClient as any;
      const { data, error } = await apiClientWithPut.put(`/tasks/${id}/status`, { status: newStatus });

      if (error) {
        Alert.alert('Error', error.toString());
        return;
      }

      if (data) {
        setTask(data);
        Alert.alert('Success', `Task status updated to ${STATUS_LABELS[newStatus]}`);
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const acceptTask = async () => {
    try {
      setUpdating(true);
      await apiClient.put(`/tasks/${id}/status`, { status: 'assigned', helper_id: user?.id });
      Alert.alert('Success', 'You have accepted the task!');
      fetchTaskDetails(); // 重新获取任务详情
    } catch (err) {
      Alert.alert('Error', 'Failed to accept the task');
    } finally {
      setUpdating(false);
    }
  };

  // 确认更新状态
  const confirmStatusUpdate = (newStatus: TaskStatus) => {
    Alert.alert(
      'Confirm Status Update',
      `Are you sure you want to mark this task as ${STATUS_LABELS[newStatus]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateTaskStatus(newStatus) }
      ]
    );
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Loading task details...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTaskDetails}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (!task) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Task not found</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const isCreator = user?.id === task.creator_id;
  const isHelper = user?.id === task.helper_id;

  // 确定用户可以执行的操作
  const canCancel = isCreator && ['open', 'assigned'].includes(task.status);
  const canComplete = isHelper && task.status === 'assigned';
  const canAccept = !isCreator && task.status === 'open' && !task.helper_id; // 只有非创建者才能接受任务
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 任务标题和状态 */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{task.title}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[task.status] }]}>
            <ThemedText style={styles.statusText}>{STATUS_LABELS[task.status]}</ThemedText>
          </View>
        </View>

        {/* 任务详情 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Description</ThemedText>
          <ThemedText style={styles.description}>{task.description}</ThemedText>
        </View>

        {/* 任务信息 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Details</ThemedText>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Category:</ThemedText>
            <ThemedText style={styles.detailValue}>{task.category || 'General'}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Reward:</ThemedText>
            <ThemedText style={styles.detailValue}>${task.reward || 0}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Location:</ThemedText>
            <ThemedText style={styles.detailValue}>{task.postal_code}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Posted by:</ThemedText>
            <ThemedText style={styles.detailValue}>{task.creator_name}</ThemedText>
          </View>

          {task.helper_name && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Assigned to:</ThemedText>
              <ThemedText style={styles.detailValue}>{task.helper_name}</ThemedText>
            </View>
          )}

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Created:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {new Date(task.created_at).toLocaleDateString()}
            </ThemedText>
          </View>

          {task.completed_at && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Completed:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {new Date(task.completed_at).toLocaleDateString()}
              </ThemedText>
            </View>
          )}
        </View>

        {/* 状态管理按钮 */}
        {(canCancel || canComplete) && (
          <View style={styles.actionsContainer}>
            <ThemedText style={styles.sectionTitle}>Actions</ThemedText>

            {canCancel && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => confirmStatusUpdate('cancelled')}
                disabled={updating}
              >
                <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>Cancel Task</ThemedText>
              </TouchableOpacity>
            )}

            {canComplete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => confirmStatusUpdate('completed')}
                disabled={updating}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>Mark as Completed</ThemedText>
              </TouchableOpacity>
            )}

            {updating && (
              <ActivityIndicator style={styles.updatingIndicator} color="#4CAF50" />
            )}
          </View>
        )}
        {/* 任务操作：接受任务 */}
        {canAccept && (
            <TouchableOpacity style={styles.acceptButton} onPress={acceptTask} disabled={updating}>
              {updating ? (
                  <ActivityIndicator color="#FFF" />
              ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <ThemedText style={styles.buttonText}>Accept Task</ThemedText>
                  </>
              )}
            </TouchableOpacity>
        )}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center' },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  updatingIndicator: {
    marginTop: 8,
  },
}); 