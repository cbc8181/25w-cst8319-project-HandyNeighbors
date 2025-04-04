import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import {AuthProvider} from "@/contexts/AuthContext";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function InnerLayout() {
    const { theme } = useThemeContext();
    const navTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

    return (
        <NavigationThemeProvider value={navTheme}>
            <Stack>
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                <Stack.Screen name="signin" options={{ title: 'Sign In', headerShown: true }} />
                <Stack.Screen name="signup" options={{ title: 'Join', headerShown: true }} />
                <Stack.Screen name="home" options={{ title: 'Home', headerShown: true }} />
                <Stack.Screen name="admin" options={{ headerShown: false }} />
            </Stack>
        </NavigationThemeProvider>
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

    if (!loaded) return null;

    return (
        <AuthProvider>
        <ThemeProvider>
            <InnerLayout />
        </ThemeProvider>
        </AuthProvider>
    );
}
