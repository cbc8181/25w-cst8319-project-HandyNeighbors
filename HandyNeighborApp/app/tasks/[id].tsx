import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

// 任务状态类型
type TaskStatus = 'open' | 'assigned' | 'completed' | 'cancelled';

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

const STATUS_COLORS: Record<TaskStatus, string> = {
  open: '#4CAF50',
  assigned: '#2196F3',
  completed: '#9C27B0',
  cancelled: '#F44336',
};

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

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await apiClient.get<Task>(`/tasks/${id}`);
      if (error) {
        setError(typeof error === 'string' ? error : 'Failed to load task details');
        return;
      }
      if (data) setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (newStatus: TaskStatus) => {
    try {
      setUpdating(true);
      const { data, error } = await (apiClient as any).put(`/tasks/${id}/status`, { status: newStatus });
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
      fetchTaskDetails();
    } catch (err) {
      Alert.alert('Error', 'Failed to accept the task');
    } finally {
      setUpdating(false);
    }
  };

  const confirmStatusUpdate = (newStatus: TaskStatus) => {
    Alert.alert('Confirm Status Update', `Are you sure you want to mark this task as ${STATUS_LABELS[newStatus]}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateTaskStatus(newStatus) },
    ]);
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return (
        <ThemedView style={[styles.loadingContainer, { backgroundColor: background }]}>
          <ActivityIndicator size="large" color={STATUS_COLORS.open} />
          <ThemedText style={[styles.loadingText, { color: icon }]}>Loading task details...</ThemedText>
        </ThemedView>
    );
  }

  if (error) {
    return (
        <ThemedView style={[styles.errorContainer, { backgroundColor: background }]}>
          <Ionicons name="alert-circle-outline" size={48} color={STATUS_COLORS.cancelled} />
          <ThemedText style={[styles.errorText, { color: STATUS_COLORS.cancelled }]}>{error}</ThemedText>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: STATUS_COLORS.open }]} onPress={fetchTaskDetails}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
    );
  }

  if (!task) {
    return (
        <ThemedView style={[styles.errorContainer, { backgroundColor: background }]}>
          <ThemedText style={styles.errorText}>Task not found</ThemedText>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: STATUS_COLORS.open }]} onPress={() => router.back()}>
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
    );
  }

  const isCreator = user?.id === task.creator_id;
  const isHelper = user?.id === task.helper_id;
  const canCancel = isCreator && ['open', 'assigned'].includes(task.status);
  const canComplete = isHelper && task.status === 'assigned';
  const canAccept = !isCreator && task.status === 'open' && !task.helper_id;

  return (
      <ThemedView style={[styles.container, { backgroundColor: background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: text }]}>{task.title}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[task.status] }]}>
              <ThemedText style={styles.statusText}>{STATUS_LABELS[task.status]}</ThemedText>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: card }]}>
            <ThemedText style={[styles.sectionTitle, { color: text }]}>Description</ThemedText>
            <ThemedText style={[styles.description, { color: text }]}>{task.description}</ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: card }]}>
            <ThemedText style={[styles.sectionTitle, { color: text }]}>Details</ThemedText>

            {[{
              label: 'Category:', value: task.category || 'General'
            }, {
              label: 'Reward:', value: `$${task.reward || 0}`
            }, {
              label: 'Location:', value: task.postal_code
            }, {
              label: 'Posted by:', value: task.creator_name
            }, ...(task.helper_name ? [{ label: 'Assigned to:', value: task.helper_name }] : []), {
              label: 'Created:', value: new Date(task.created_at).toLocaleDateString()
            }, ...(task.completed_at ? [{ label: 'Completed:', value: new Date(task.completed_at).toLocaleDateString() }] : [])
            ].map(({ label, value }, i) => (
                <View key={i} style={styles.detailRow}>
                  <ThemedText style={[styles.detailLabel, { color: icon }]}>{label}</ThemedText>
                  <ThemedText style={[styles.detailValue, { color: text }]}>{value}</ThemedText>
                </View>
            ))}
          </View>

          {(canCancel || canComplete) && (
              <View style={[styles.actionsContainer, { backgroundColor: card }]}>
                <ThemedText style={[styles.sectionTitle, { color: text }]}>Actions</ThemedText>
                {canCancel && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: STATUS_COLORS.cancelled }]}
                        onPress={() => confirmStatusUpdate('cancelled')} disabled={updating}>
                      <Ionicons name="close-circle-outline" size={20} color="#FFF" />
                      <ThemedText style={styles.actionButtonText}>Cancel Task</ThemedText>
                    </TouchableOpacity>
                )}
                {canComplete && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: STATUS_COLORS.completed }]}
                        onPress={() => confirmStatusUpdate('completed')} disabled={updating}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                      <ThemedText style={styles.actionButtonText}>Mark as Completed</ThemedText>
                    </TouchableOpacity>
                )}
                {updating && (
                    <ActivityIndicator style={styles.updatingIndicator} color={STATUS_COLORS.open} />
                )}
              </View>
          )}

          {canAccept && (
              <TouchableOpacity style={[styles.acceptButton, { backgroundColor: STATUS_COLORS.open }]} onPress={acceptTask} disabled={updating}>
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
  container: { flex: 1 },
  scrollView: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, textAlign: 'center', marginVertical: 16 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  retryButtonText: { color: '#FFF', fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginLeft: 8 },
  statusText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  section: { borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontSize: 16, fontWeight: '500', width: 100 },
  detailValue: { fontSize: 16, flex: 1 },
  actionsContainer: { borderRadius: 8, padding: 16, marginBottom: 24 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  acceptButton: { padding: 15, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  actionButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16, marginLeft: 8 },
  updatingIndicator: { marginTop: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
