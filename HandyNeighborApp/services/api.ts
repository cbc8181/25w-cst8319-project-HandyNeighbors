import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_BASE_URL, AUTH_ENDPOINTS, buildUrl } from '@/config/api';

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
      const fullUrl = buildUrl(endpoint);
      console.log('Making GET request to:', fullUrl);
      
      const headers = await this.getHeaders();
      const response = await fetch(fullUrl, { 
        headers,
      });
      
      console.log('GET Response status:', response.status);
      
      if (response.status === 401) {
        await this.handleUnauthorized();
        return { error: 'Unauthorized' };
      }

      const data = await response.json();
      console.log('GET Response data:', data);
      return { data };
    } catch (error) {
      console.error('GET Request error:', error);
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const fullUrl = buildUrl(endpoint);
      console.log('Making POST request to:', fullUrl);
      console.log('Request body:', body);
      
      const headers = await this.getHeaders();
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log('POST Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Server error: ${response.status}`;
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }
        
        if (response.status === 401) {
          await this.handleUnauthorized();
        }
        return { error: errorMessage };
      }

      const data = await response.json();
      console.log('POST Response data:', data);
      return { data };
    } catch (error) {
      console.error('POST Request error:', error);
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

  // Add other methods (PUT, DELETE, etc.) as needed
}; 