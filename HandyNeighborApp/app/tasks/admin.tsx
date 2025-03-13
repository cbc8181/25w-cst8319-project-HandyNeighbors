import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

// 模拟任务数据
const MOCK_TASKS = [
  {
    id: 1,
    title: "Fix bathroom sink",
    status: "open",
    creator: "John Doe",
    date: "2024-03-11",
  },
  {
    id: 2,
    title: "Paint living room",
    status: "assigned",
    creator: "Jane Smith",
    date: "2024-03-10",
  },
  {
    id: 3,
    title: "Install new light fixture",
    status: "completed",
    creator: "Mike Johnson",
    date: "2024-03-09",
  },
];

// 获取状态对应的颜色
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return '#4CAF50';
    case 'assigned':
      return '#2196F3';
    case 'completed':
      return '#9E9E9E';
    default:
      return '#000000';
  }
};

export default function AdminTaskList() {
  const { user, isAuthenticated } = useAuth();

  // 检查是否是管理员
  useEffect(() => {
    if (!isAuthenticated || user?.user_type !== 'admin') {
      router.replace('/welcome');
    }
  }, [isAuthenticated, user]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Admin Task List</ThemedText>
        </View>

        {MOCK_TASKS.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(task.status) },
                ]}
              >
                <ThemedText style={styles.statusText}>
                  {task.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>

            <View style={styles.taskInfo}>
              <ThemedText style={styles.taskCreator}>
                Created by: {task.creator}
              </ThemedText>
              <ThemedText style={styles.taskDate}>{task.date}</ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskCreator: {
    fontSize: 14,
    color: '#666666',
  },
  taskDate: {
    fontSize: 14,
    color: '#666666',
  },
}); 