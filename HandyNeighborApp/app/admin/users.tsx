import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function UserManagement() {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      status: "active",
      type: "user",
      joinDate: "2024-03-01"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "active",
      type: "user",
      joinDate: "2024-03-05"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.j@example.com",
      status: "suspended",
      type: "user",
      joinDate: "2024-03-08"
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>User Management</ThemedText>
        </View>

        <View style={styles.userList}>
          {users.map(user => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <ThemedText style={styles.userName}>{user.name}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
                  <ThemedText style={styles.statusText}>{user.status}</ThemedText>
                </View>
              </View>

              <View style={styles.userDetails}>
                <ThemedText style={styles.detailText}>Email: {user.email}</ThemedText>
                <ThemedText style={styles.detailText}>Type: {user.type}</ThemedText>
                <ThemedText style={styles.detailText}>Joined: {user.joinDate}</ThemedText>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <ThemedText style={styles.actionButtonText}>View Profile</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                >
                  <ThemedText style={styles.actionButtonTextSecondary}>
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userList: {
    gap: 15,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
}); 