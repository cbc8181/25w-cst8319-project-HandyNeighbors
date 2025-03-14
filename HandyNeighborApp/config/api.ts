import { Platform } from 'react-native';

// Get the appropriate base URL based on the platform and environment
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      // For iOS devices, use your computer's IP address
      return 'http://192.168.2.85:3000';
    } else {
      // Web - use localhost
      return 'http://localhost:3000';
    }
  }
  // Production URL (when you deploy your backend)
  return 'https://your-production-url.com';
};

export const API_BASE_URL = getBaseUrl();

// Full API URL with /api prefix
export const API_PREFIX = `${API_BASE_URL}/api`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  register: 'auth/register',
  login: 'auth/login',
};

// Task endpoints
export const TASK_ENDPOINTS = {
  list: 'tasks',
  create: 'tasks',
  detail: (id: string) => `tasks/${id}`,
};

// User endpoints
export const USER_ENDPOINTS = {
  profile: 'users/profile',
  update: 'users/update',
};

// Constructor for full URLs
export const buildUrl = (endpoint: string): string => {
  // Remove any leading slashes from the endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_PREFIX}/${cleanEndpoint}`;
  console.log('Built URL:', url);
  return url;
}; 