import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';

// 模拟任务数据
const MOCK_TASKS = [
  {
    id: 1,
    title: 'Fix leaking faucet',
    status: 'open',
    creator: 'John Doe',
    date: '2024-03-11',
  },
  {
    id: 2,
    title: 'Paint living room',
    status: 'assigned',
    creator: 'Jane Smith',
    date: '2024-03-12',
  },
  {
    id: 3,
    title: 'Lawn maintenance',
    status: 'completed',
    creator: 'Mike Johnson',
    date: '2024-03-10',
  },
];

// 获取状态对应的颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return '#FFA726'; // Orange
    case 'assigned':
      return '#42A5F5'; // Blue
    case 'completed':
      return '#66BB6A'; // Green
    default:
      return '#9E9E9E'; // Grey
  }
};

export default function TaskManagement() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Task Management</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        {MOCK_TASKS.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                <ThemedText style={styles.statusText}>{task.status}</ThemedText>
              </View>
            </View>

            <View style={styles.taskDetails}>
              <ThemedText style={styles.taskInfo}>Created by: {task.creator}</ThemedText>
              <ThemedText style={styles.taskInfo}>Date: {task.date}</ThemedText>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  taskDetails: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    marginTop: 5,
  },
  taskInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
}); 