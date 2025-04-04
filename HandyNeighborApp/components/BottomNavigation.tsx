import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

type NavPath = '/home' | '/tasks/manage' | '/search' | '/settings';

interface NavItem {
  name: string;
  icon: string;
  path: NavPath;
}

const navItems: NavItem[] = [
  { name: 'Home', icon: 'home', path: '/home' },
  { name: 'Tasks', icon: 'list', path: '/tasks/manage' },
  { name: 'Search', icon: 'search', path: '/search' },
  { name: 'Settings', icon: 'settings', path: '/settings' },
];

export default function BottomNavigation() {
  const currentPath = usePathname();

  // 🌓 Dynamic theme colors
  const background = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

  const handleNavigation = (path: NavPath) => {
    router.push(path);
  };

  return (
      <View style={[styles.navbar, { backgroundColor: background, borderTopColor: border }]}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
              <TouchableOpacity
                  key={item.name}
                  style={[styles.navItem, isActive && { borderBottomColor: tint, borderBottomWidth: 2 }]}
                  onPress={() => handleNavigation(item.path)}
              >
                <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? tint : icon}
                />
                <ThemedText
                    style={[
                      styles.navText,
                      { color: isActive ? tint : text },
                      isActive && styles.activeNavText,
                    ]}
                >
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
          );
        })}
      </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeNavText: {
    fontWeight: 'bold',
  },
});
