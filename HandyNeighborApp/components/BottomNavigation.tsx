import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
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

  const handleNavigation = (path: NavPath) => {
    router.push(path);
  };

  return (
    <View style={styles.navbar}>
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <TouchableOpacity
            key={item.name}
            style={[styles.navItem, isActive && styles.activeNavItem]}
            onPress={() => handleNavigation(item.path)}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={isActive ? '#000' : '#666'}
            />
            <ThemedText style={[styles.navText, isActive && styles.activeNavText]}>
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
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  navText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#000000',
    fontWeight: 'bold',
  },
}); 