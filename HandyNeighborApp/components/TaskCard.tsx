import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';
import TaskStatusManager from './TaskStatusManager';
import { useAuth } from '@/contexts/AuthContext';

// Task images based on category - using EXACT filenames from assets folder
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
  reward?: number;       // Support both reward and payment properties
  payment?: number;      // for backward compatibility
  category?: string;
  status?: string;       // 任务状态
  creator_id?: number;   // 创建者ID
  helper_id?: number;    // 帮助者ID
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

  // Support both reward and payment properties
  const paymentAmount = task.reward || task.payment || 0;

  // 处理任务卡片点击
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // 默认导航到任务详情页面
      router.push(`/tasks/${task.id}`);
    }
  };

  // 处理状态更新
  const handleStatusUpdated = (newStatus: string) => {
    setTaskStatus(newStatus);
    if (onStatusUpdated) {
      onStatusUpdated(task.id, newStatus);
    }
  };

  // 检查用户是否是创建者或帮助者
  const isCreator = user?.id === task.creator_id;
  const isHelper = user?.id === task.helper_id;

  // Get the appropriate image based on category
  const getTaskImage = (): ImageSourcePropType => {
    if (!task.category) return CATEGORY_IMAGES.default;

    const category = task.category.toLowerCase();

    if (category.includes('garden') || category.includes('lawn') || category.includes('yard')) {
      return CATEGORY_IMAGES.gardening;
    }

    if (category.includes('clean') || category.includes('wash') || category.includes('scrub')) {
      return CATEGORY_IMAGES.cleaning;
    }

    if (category.includes('repair') || category.includes('fix') || category.includes('build')) {
      return CATEGORY_IMAGES.repairs;
    }

    if (category.includes('deliver') || category.includes('transport') || category.includes('pickup')) {
      return CATEGORY_IMAGES.delivery;
    }

    if (category.includes('snow') || category.includes('shovel') || category.includes('winter')) {
      return CATEGORY_IMAGES.snow;
    }

    if (category.includes('tutor') || category.includes('teach') || category.includes('education')) {
      return CATEGORY_IMAGES.tutoring;
    }

    return CATEGORY_IMAGES.default;
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress}>
        <View style={styles.cardImagePlaceholder}>
          <Image source={getTaskImage()} style={styles.compactImage} resizeMode="cover" />
        </View>
        <ThemedText style={styles.compactTitle} numberOfLines={1}>{task.title}</ThemedText>
        <ThemedText style={styles.compactLocation} numberOfLines={1}>{task.location}</ThemedText>
        <ThemedText style={styles.compactReward}>${paymentAmount}</ThemedText>

        {/* 显示任务状态 */}
        {task.status && (
          <View style={[styles.statusBadge, getStatusStyle(task.status)]}>
            <ThemedText style={styles.statusText}>{getStatusLabel(task.status)}</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <TouchableOpacity style={styles.card} onPress={handlePress}>
        <View style={styles.cardContent}>
          <View style={styles.cardTextContent}>
            <ThemedText style={styles.title}>{task.title}</ThemedText>
            <ThemedText style={styles.description} numberOfLines={2}>
              {task.description}
            </ThemedText>
            <View style={styles.footer}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#666" />
                <ThemedText style={styles.locationText}>{task.location}</ThemedText>
              </View>
              <ThemedText style={styles.reward}>${paymentAmount}</ThemedText>
            </View>
          </View>
          <View style={styles.cardImageContainer}>
            <Image source={getTaskImage()} style={styles.cardImage} resizeMode="cover" />
          </View>
        </View>

        {/* 显示任务状态和分类 */}
        <View style={styles.tagsContainer}>
          {task.status && (
            <View style={[styles.statusBadge, getStatusStyle(task.status)]}>
              <ThemedText style={styles.statusText}>{getStatusLabel(task.status)}</ThemedText>
            </View>
          )}

          {task.category && (
            <View style={styles.categoryTag}>
              <ThemedText style={styles.categoryText}>{task.category}</ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* 状态管理控件 */}
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
  );
}

// 获取状态标签
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Open',
    assigned: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status] || status;
}

// 获取状态样式
function getStatusStyle(status: string): any {
  const colors: Record<string, { backgroundColor: string }> = {
    open: { backgroundColor: '#4CAF50' },      // 绿色
    assigned: { backgroundColor: '#2196F3' },  // 蓝色
    completed: { backgroundColor: '#9C27B0' }, // 紫色
    cancelled: { backgroundColor: '#F44336' }  // 红色
  };
  return colors[status] || { backgroundColor: '#999999' };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
  },
  cardTextContent: {
    flex: 1,
    marginRight: 10,
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  reward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  tagsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  categoryTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Compact card styles
  compactCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#000000',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  compactLocation: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  compactReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
}); 