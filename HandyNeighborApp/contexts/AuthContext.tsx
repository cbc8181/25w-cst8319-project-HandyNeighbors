import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// 定义用户类型
interface User {
  id: number;
  email: string;
  full_name: string;
  user_type: string;
  postal_code?: string;
  student_id?: string;
  avatar_url?: string;
  description?: string;
  [key: string]: any; // 允许额外的字段
}

// 定义认证上下文类型
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication state...');

      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      console.log('Stored token:', storedToken ? 'exists' : 'null');
      console.log('Stored user:', storedUser ? 'exists' : 'null');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User authenticated:', parsedUser.email);
      } else {
        // 确保如果没有存储的凭据，状态被重置
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        console.log('No stored credentials found');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // 出错时重置状态
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (token: string, user: User) => {
    try {
      console.log('Login called with:', { userType: user.user_type });

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      console.log('Authentication state set, now navigating');

      // 根据用户类型导航到不同页面
      if (user.user_type === 'admin') {
        // 管理员用户导航到管理员仪表板
        router.replace('/admin/dashboard');
      } else {
        // 普通用户导航到主页
        router.replace('/home');
      }
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/welcome');
    } catch (error) {
      console.error('Error removing auth data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout,setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 