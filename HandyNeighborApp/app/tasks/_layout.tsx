import { Stack } from 'expo-router';
import React from 'react';

export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="manage"
        options={{
          headerShown: false,
          title: 'Manage Tasks',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: 'Task Details',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShown: true,
          title: 'Create Task',
        }}
      />
    </Stack>
  );
} 