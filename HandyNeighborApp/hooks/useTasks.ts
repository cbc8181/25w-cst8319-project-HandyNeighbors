import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import { TASK_ENDPOINTS } from '@/config/api';
import { Task } from '@/components/TaskCard';

interface UseTasksOptions {
  initialLoadingState?: boolean;
  initialSearchTerm?: string;
  initialCategory?: string | null;
}

export default function useTasks(options: UseTasksOptions = {}) {
  const {
    initialLoadingState = true,
    initialSearchTerm = '',
    initialCategory = null
  } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(initialLoadingState);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await apiClient.get<any[]>(TASK_ENDPOINTS.list);
      
      if (error) {
        console.error('Error fetching tasks:', error);
        setError(error);
        return;
      }
      
      if (data) {
        // Normalize task data to ensure consistent properties
        const normalizedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          location: task.postal_code || 'Unknown location',
          // Support both reward and payment properties for compatibility
          reward: task.reward || task.payment || 0,
          payment: task.payment || task.reward || 0,
          category: task.category || 'General',
          created_at: task.created_at || new Date().toISOString(),
          user_id: task.user_id || 0,
          user_name: task.user_name || 'Anonymous',
        }));
        
        setTasks(normalizedTasks);
        
        // For demo purposes, randomly select some tasks as "nearby"
        // In a real app, you would use geolocation data to determine this
        const nearby = [...normalizedTasks]
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(3, normalizedTasks.length));
        
        setNearbyTasks(nearby);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
      console.error(message, error);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterTasks = useCallback(() => {
    let filtered = [...tasks];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.location && task.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(task => 
        task.category && task.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    return filtered;
  }, [tasks, searchTerm, selectedCategory]);

  // Initial fetch on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    nearbyTasks,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    fetchTasks,
    filterTasks,
    filteredTasks: filterTasks()
  };
} 