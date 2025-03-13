import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/services/api';

// 任务状态类型
type TaskStatus = 'open' | 'assigned' | 'completed' | 'cancelled';

// 任务状态标签颜色
const STATUS_COLORS: Record<TaskStatus, string> = {
  open: '#4CAF50',      // 绿色
  assigned: '#2196F3',  // 蓝色
  completed: '#9C27B0', // 紫色
  cancelled: '#F44336'  // 红色
};

// 任务状态标签 - 英文
const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Open',
  assigned: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

interface TaskStatusManagerProps {
  taskId: number;
  currentStatus: TaskStatus;
  isCreator: boolean;
  isHelper: boolean;
  onStatusUpdated?: (newStatus: TaskStatus) => void;
  compact?: boolean;
}

export default function TaskStatusManager({
  taskId,
  currentStatus,
  isCreator,
  isHelper,
  onStatusUpdated,
  compact = false
}: TaskStatusManagerProps) {
  const [updating, setUpdating] = useState(false);

  // 确定用户可以执行的操作
  const canCancel = isCreator && ['open', 'assigned'].includes(currentStatus);
  const canComplete = isHelper && currentStatus === 'assigned';

  // 如果用户没有权限执行任何操作，不显示组件
  if (!canCancel && !canComplete) {
    return null;
  }

  // 更新任务状态
  const updateTaskStatus = async (newStatus: TaskStatus) => {
    try {
      setUpdating(true);

      const { data, error } = await apiClient.put(`/tasks/${taskId}/status`, { status: newStatus });

      if (error) {
        Alert.alert('Error', error.toString());
        return;
      }

      if (data) {
        Alert.alert('Success', `Task status updated to ${STATUS_LABELS[newStatus]}`);
        if (onStatusUpdated) {
          onStatusUpdated(newStatus);
        }
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update task status');
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

  // 紧凑模式 - 适用于任务列表中的快速操作
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {canCancel && (
          <TouchableOpacity
            style={[styles.compactButton, styles.cancelButton]}
            onPress={() => confirmStatusUpdate('cancelled')}
            disabled={updating}
          >
            <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.compactButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        )}

        {canComplete && (
          <TouchableOpacity
            style={[styles.compactButton, styles.completeButton]}
            onPress={() => confirmStatusUpdate('completed')}
            disabled={updating}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.compactButtonText}>Complete</ThemedText>
          </TouchableOpacity>
        )}

        {updating && (
          <ActivityIndicator size="small" color="#4CAF50" style={styles.compactLoader} />
        )}
      </View>
    );
  }

  // 完整模式 - 适用于详情页面
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Task Actions</ThemedText>

      {canCancel && (
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => confirmStatusUpdate('cancelled')}
          disabled={updating}
        >
          <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>Cancel Task</ThemedText>
        </TouchableOpacity>
      )}

      {canComplete && (
        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={() => confirmStatusUpdate('completed')}
          disabled={updating}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>Mark as Completed</ThemedText>
        </TouchableOpacity>
      )}

      {updating && (
        <ActivityIndicator style={styles.loader} color="#4CAF50" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
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
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  loader: {
    marginTop: 8,
  },

  // 紧凑模式样式
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  compactButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  compactLoader: {
    marginLeft: 8,
  },
}); 