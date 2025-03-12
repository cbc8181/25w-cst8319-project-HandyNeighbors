import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedTextInput } from './ThemedTextInput';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ visible, onClose }: AdminLoginModalProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // 使用硬编码的凭据进行验证
      if (username === 'admin' && password === 'admin123') {
        console.log('Login successful with hardcoded credentials');

        Alert.alert('Success', 'Login successful! Redirecting to dashboard...');

        // 模拟用户数据
        const mockUser = {
          id: 1,
          username: 'admin',
          user_type: 'admin',
          email: 'admin@example.com',
          full_name: 'Admin User'
        };

        const mockToken = 'mock-admin-token-12345';

        // 延迟一下，让用户看到成功消息
        setTimeout(async () => {
          // 调用 login 函数，它会处理数据存储和路由跳转
          await login(mockToken, mockUser);

          // 关闭模态框
          onClose();
        }, 1000);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ThemedText type="title" style={styles.title}>
            Admin Login
          </ThemedText>

          {error && (
            <ThemedText style={styles.error}>
              {error}
            </ThemedText>
          )}

          <ThemedTextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
          />

          <ThemedTextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Login'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <ThemedText style={styles.cancelButtonText}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 15,
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
  },
});

export default AdminLoginModal; 