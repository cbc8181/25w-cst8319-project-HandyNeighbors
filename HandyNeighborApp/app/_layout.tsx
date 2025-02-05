import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Define public routes that don't require authentication
const publicRoutes = ['welcome', 'signin', 'signup'];

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const inPublicRoute = publicRoutes.includes(segments[0]);
    
    if (!isAuthenticated && !inPublicRoute) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Public Routes */}
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen 
          name="signin" 
          options={{ 
            headerShown: true, 
            title: 'Sign In',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
          }} 
        />
        <Stack.Screen 
          name="signup" 
          options={{ 
            headerShown: true, 
            title: 'Join',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
          }} 
        />
        
        {/* Protected Routes */}
        <Stack.Screen 
          name="home" 
          options={{ 
            headerShown: true, 
            title: 'Home',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
