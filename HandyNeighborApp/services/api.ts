import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_BASE_URL, AUTH_ENDPOINTS } from '@/config/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const apiClient = {
  async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  },

  async handleUnauthorized() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/welcome');
  },

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(endpoint, { headers });
      
      if (response.status === 401) {
        await this.handleUnauthorized();
        return { error: 'Unauthorized' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          await this.handleUnauthorized();
        }
        return { error: data.error || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  },

  // Add other methods (PUT, DELETE, etc.) as needed
}; 