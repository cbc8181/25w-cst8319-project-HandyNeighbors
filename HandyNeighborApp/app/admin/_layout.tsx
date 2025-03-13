import { Stack, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // 检查认证状态和用户类型
  useEffect(() => {
    const checkAuth = async () => {
      // 添加一些延迟来确保认证状态完全加载
      await new Promise(resolve => setTimeout(resolve, 500));

      setLoading(false);

      // 验证完成后禁用自动重定向
      if (pathname === '/admin/debug') {
        // 调试页面不需要重定向
        return;
      }

      if (!isAuthenticated || !user) {
        // 如果未登录，重定向到欢迎页面
        console.log('Not authenticated, redirecting to welcome');
        router.replace('/welcome');
      } else if (user.user_type !== 'admin') {
        // 如果不是管理员，重定向到主页
        console.log('Not admin, redirecting to home');
        router.replace('/home');
      }
    };

    checkAuth();
  }, [user, isAuthenticated, pathname]);

  // 如果正在加载，返回 null
  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="debug" />
    </Stack>
  );
} 