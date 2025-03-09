import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import TaskCard, { Task } from '@/components/TaskCard';

interface TaskListProps {
    tasks: Task[];
    onTaskPress: (taskId: number) => void;
}

// 解析 `location` 字段
const getCoordinates = (location: string) => {
    if ( location.startsWith('POINT')) {
        const matches = location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
        if (matches) {
            return {
                longitude: parseFloat(matches[1]),
                latitude: parseFloat(matches[2]),
            };
        }
    }
    return null; // 如果解析失败，返回 null
};

export default function TaskList({ tasks, onTaskPress }: TaskListProps) {
    return (
        <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
                const coordinates = getCoordinates(item.location);
                const taskWithCoordinates = coordinates
                    ? { ...item, coordinates } // ✅ 解析成功，创建新对象
                    : item; // 解析失败，保留原始 task

                return (
                    <TouchableOpacity onPress={() => onTaskPress(item.id)}>
                        <TaskCard task={taskWithCoordinates} />
                    </TouchableOpacity>
                );
            }}
            ListEmptyComponent={<ThemedText style={styles.noTasks}>No tasks available.</ThemedText>}
        />
    );
}

const styles = StyleSheet.create({
    noTasks: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});
