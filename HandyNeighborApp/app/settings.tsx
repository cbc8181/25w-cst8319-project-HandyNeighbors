import React from 'react';
import { StyleSheet, View, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { preference, setPreference } = useThemeContext();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  // 🎨 动态颜色
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');

  const handleLogout = async () => {
    await logout();
  };

  const renderSettingItem = (
      iconName: string,
      title: string,
      description: string,
      action: React.ReactNode
  ) => (
      <View style={[styles.settingItem]}>
        <View style={[styles.settingIconContainer, { backgroundColor: card }]}>
          <Ionicons name={iconName as any} size={24} color={icon} />
        </View>
        <View style={styles.settingContent}>
          <ThemedText style={[styles.settingTitle, { color: text }]}>{title}</ThemedText>
          <ThemedText style={[styles.settingDescription, { color: icon }]}>{description}</ThemedText>
        </View>
        {action}
      </View>
  );

  return (
      <ThemedView style={[styles.container, { backgroundColor: background  }]}>
        <View style={[styles.header, { backgroundColor: card }]}>
          <ThemedText style={[styles.title, { color: text }]}>Settings</ThemedText>
        </View>

        <ScrollView style={styles.settingsContainer}>
          {/* User Profile Section */}
          <View style={[styles.profileSection, { backgroundColor: card }]}>
            <View style={styles.avatarContainer}>
              <ThemedText style={styles.avatarText}>{user?.full_name?.charAt(0) || 'U'}</ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={[styles.profileName, { color: text }]}>{user?.full_name || 'User'}</ThemedText>
              <ThemedText style={[styles.profileEmail, { color: icon }]}>{user?.email || 'email@example.com'}</ThemedText>
            </View>
            <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: card }]}>
              <ThemedText style={[styles.editProfileText, { color: text }]}>Edit</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Notifications Section */}
          <View style={[styles.section, { backgroundColor: card }]}>
            <ThemedText style={[styles.sectionTitle, { color: text }]}>Notifications</ThemedText>
            {renderSettingItem(
                'notifications',
                'Push Notifications',
                'Receive notifications for new tasks and updates',
                <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor="#fff"
                />
            )}
          </View>

          {/* Preferences Section */}
          <View style={[styles.section, { backgroundColor: card }]}>
            <ThemedText style={[styles.sectionTitle, { color: text }]}>Preferences</ThemedText>
            {renderSettingItem(
                'moon',
                'Dark Mode',
                'Use dark theme throughout the app',
                <Switch
                    value={preference !== 'light'}
                    onValueChange={(enabled) => setPreference(enabled ? 'dark' : 'light')}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor="#fff"
                />
            )}
            {renderSettingItem(
                'location',
                'Location Services',
                'Allow app to access your location',
                <Switch
                    value={locationEnabled}
                    onValueChange={setLocationEnabled}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor="#fff"
                />
            )}
          </View>

          {/* Account Section */}
          <View style={[styles.section, { backgroundColor: card }]}>
            <ThemedText style={[styles.sectionTitle, { color: text }]}>Account</ThemedText>
            <TouchableOpacity style={styles.accountOption}>
              <Ionicons name="shield-checkmark" size={24} color={icon} style={styles.accountOptionIcon} />
              <ThemedText style={[styles.accountOptionText, { color: text }]}>Privacy & Security</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.accountOption}>
              <Ionicons name="help-circle" size={24} color={icon} style={styles.accountOptionIcon} />
              <ThemedText style={[styles.accountOptionText, { color: text }]}>Help & Support</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.accountOption}>
              <Ionicons name="information-circle" size={24} color={icon} style={styles.accountOptionIcon} />
              <ThemedText style={[styles.accountOptionText, { color: text }]}>About</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={icon} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FFF" style={styles.logoutIcon} />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        <BottomNavigation />
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingsContainer: { flex: 1 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 5,
  },
  editProfileButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  settingContent: {
    flex: 1,
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 3,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  accountOptionIcon: {
    marginRight: 15,
  },
  accountOptionText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 30,
    padding: 15,
    borderRadius: 10,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
