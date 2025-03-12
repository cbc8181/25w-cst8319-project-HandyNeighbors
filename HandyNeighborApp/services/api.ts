import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_BASE_URL, AUTH_ENDPOINTS, buildUrl } from '@/config/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const apiClient = {
  async getHeaders() {
    try {
      const token = await AsyncStorage.getItem('token');
      return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
    } catch (error) {
      console.error('Error getting headers:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
  },

  async handleUnauthorized() {
    try {
      await AsyncStorage.multiRemove(['userToken', 'user']);
      router.replace('/welcome');
    } catch (error) {
      console.error('Error handling unauthorized:', error);
    }
  },

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const fullUrl = buildUrl(endpoint);
      console.log('GET Request:', { url: fullUrl });

      const headers = await this.getHeaders();
      const response = await fetch(fullUrl, { headers });

      console.log('Response status:', response.status);

      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        return { error: 'Invalid server response' };
      }

      if (response.status === 401) {
        await this.handleUnauthorized();
        return { error: 'Unauthorized access' };
      }

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Server error: ${response.status}`;
        console.error('Request failed:', errorMessage);
        return { error: errorMessage };
      }

      return { data: responseData };
    } catch (error) {
      console.error('Request failed:', error);
      return {
        error: error instanceof Error
          ? error.message
          : 'Network request failed'
      };
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const fullUrl = buildUrl(endpoint);
      console.log('POST Request:', {
        url: fullUrl,
        body: body
      });

      const headers = await this.getHeaders();

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status);

      // 尝试解析响应数据
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        return { error: 'Invalid server response' };
      }

      // 处理不同的响应状态
      if (response.status === 401) {
        await this.handleUnauthorized();
        return { error: 'Unauthorized access' };
      }

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Server error: ${response.status}`;
        console.error('Request failed:', errorMessage);
        return { error: errorMessage };
      }

      return { data: responseData };
    } catch (error) {
      console.error('Request failed:', error);
      return {
        error: error instanceof Error
          ? error.message
          : 'Network request failed'
      };
    }
  },

  // Add other methods (PUT, DELETE, etc.) as needed
}; 