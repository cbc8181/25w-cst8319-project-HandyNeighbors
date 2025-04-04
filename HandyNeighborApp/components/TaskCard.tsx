import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';
import TaskStatusManager from './TaskStatusManager';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  gardening: require('../assets/images/lawning.jpg'),
  cleaning: require('../assets/images/carcleaning.jpg'),
  repairs: require('../assets/images/tool.jpg'),
  delivery: require('../assets/images/delivery.jpg'),
  snow: require('../assets/images/snowshovel.jpg'),
  tutoring: require('../assets/images/tutoring.jpg'),
  default: require('../assets/images/task.jpg')
};

export interface Task {
  id: number;
  title: string;
  description: string;
  location: string;
  reward?: number;
  payment?: number;
  category?: string;
  status?: string;
  creator_id?: number;
  helper_id?: number;
  created_at: string;
  user_id: number;
  user_name?: string;
}

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  compact?: boolean;
  onStatusUpdated?: (taskId: number, newStatus: string) => void;
  showStatusControls?: boolean;
}

export default function TaskCard({
                                   task,
                                   onPress,
                                   compact = false,
                                   onStatusUpdated,
                                   showStatusControls = false
                                 }: TaskCardProps) {
  const { user } = useAuth();
  const [taskStatus, setTaskStatus] = useState(task.status || 'open');

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const surface = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'icon');

  const paymentAmount = task.reward || task.payment || 0;

  const handlePress = () => {
    if (onPress) onPress();
    else router.push(`/tasks/${task.id}`);
  };

  const handleStatusUpdated = (newStatus: string) => {
    setTaskStatus(newStatus);
    if (onStatusUpdated) onStatusUpdated(task.id, newStatus);
  };

  const isCreator = user?.id === task.creator_id;
  const isHelper = user?.id === task.helper_id;

  const getTaskImage = (): ImageSourcePropType => {
    const category = task.category?.toLowerCase() || '';
    if (category.includes('garden')) return CATEGORY_IMAGES.gardening;
    if (category.includes('clean')) return CATEGORY_IMAGES.cleaning;
    if (category.includes('repair')) return CATEGORY_IMAGES.repairs;
    if (category.includes('deliver')) return CATEGORY_IMAGES.delivery;
    if (category.includes('snow')) return CATEGORY_IMAGES.snow;
    if (category.includes('tutor')) return CATEGORY_IMAGES.tutoring;
    return CATEGORY_IMAGES.default;
  };

  if (compact) {
    return (
        <TouchableOpacity style={[styles.compactCard, { backgroundColor: surface }]} onPress={handlePress}>
          <View style={styles.cardImagePlaceholder}>
            <Image source={getTaskImage()} style={styles.compactImage} resizeMode="cover" />
          </View>
          {task.category && (
              <View style={[styles.compactCategoryTag, { backgroundColor: surface }]}>
                <ThemedText style={[styles.categoryText, { color: muted }]}>{task.category}</ThemedText>
              </View>
          )}
          <ThemedText style={[styles.compactTitle, { color: text }]} numberOfLines={1}>{task.title}</ThemedText>
          <ThemedText style={[styles.compactLocation, { color: muted }]} numberOfLines={1}>{task.location}</ThemedText>
          <ThemedText style={[styles.compactReward, { color: text }]}>${paymentAmount}</ThemedText>
          {task.status && (
              <View style={[styles.statusBadge, getStatusStyle(task.status)]}>
                <ThemedText style={styles.statusText}>{getStatusLabel(task.status)}</ThemedText>
              </View>
          )}
        </TouchableOpacity>
    );
  }

  return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity style={[styles.card, { backgroundColor: surface }]} onPress={handlePress}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContent}>
              {task.category && (
                  <View style={[styles.categoryTagInline, { backgroundColor: surface }]}>
                    <ThemedText style={[styles.categoryText, { color: muted }]}>{task.category}</ThemedText>
                  </View>
              )}
              <ThemedText style={[styles.title, { color: text }]}>{task.title}</ThemedText>
              <ThemedText style={[styles.description, { color: muted }]} numberOfLines={2}>{task.description}</ThemedText>
              <View style={styles.footer}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={16} color={muted} />
                  <ThemedText style={[styles.locationText, { color: muted }]}>{task.location}</ThemedText>
                </View>
                <ThemedText style={[styles.reward, { color: text }]}>${paymentAmount}</ThemedText>
              </View>
            </View>
            <View style={styles.cardImageContainer}>
              <Image source={getTaskImage()} style={styles.cardImage} resizeMode="cover" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.statusActionRow, { backgroundColor: background }]}>
          {task.status && (
              <View style={[styles.statusBadgeBottom, getStatusStyle(task.status)]}>
                <ThemedText style={styles.statusText}>{getStatusLabel(task.status)}</ThemedText>
              </View>
          )}
          {showStatusControls && (
              <TaskStatusManager
                  taskId={task.id}
                  currentStatus={taskStatus as any}
                  isCreator={isCreator}
                  isHelper={isHelper}
                  onStatusUpdated={handleStatusUpdated as any}
                  compact={true}
              />
          )}
        </View>
      </View>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Open',
    assigned: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status] || status;
}

function getStatusStyle(status: string): any {
  const colors: Record<string, { backgroundColor: string }> = {
    open: { backgroundColor: '#4CAF50' },
    assigned: { backgroundColor: '#2196F3' },
    completed: { backgroundColor: '#9C27B0' },
    cancelled: { backgroundColor: '#F44336' }
  };
  return colors[status] || { backgroundColor: '#999999' };
}

const styles = StyleSheet.create({
  cardWrapper: { marginBottom: 20 },
  card: { borderRadius: 10, padding: 16, elevation: 2 },
  cardContent: { flexDirection: 'row' },
  cardTextContent: { flex: 1, marginRight: 10 },
  cardImageContainer: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, marginLeft: 4 },
  reward: { fontSize: 14, fontWeight: 'bold' },
  categoryTagInline: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8 },
  tagsContainer: { flexDirection: 'row', position: 'absolute', top: 12, right: 12 },
  categoryText: { fontSize: 10, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  statusBadgeBottom: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  compactCard: { width: 140, borderRadius: 10, padding: 12, marginRight: 12, elevation: 2 },
  cardImagePlaceholder: { width: '100%', height: 80, borderRadius: 8, marginBottom: 10, overflow: 'hidden' },
  compactImage: { width: '100%', height: '100%' },
  compactTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  compactLocation: { fontSize: 12, marginBottom: 4 },
  compactReward: { fontSize: 14, fontWeight: 'bold' },
  compactCategoryTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 4 }
});
