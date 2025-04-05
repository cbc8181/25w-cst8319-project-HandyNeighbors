import React, { useState } from 'react';
import { View, Button, TextInput, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import { API_PREFIX } from '@/config/api';

export default function EditProfileScreen() {
    const { user, setUser } = useAuth();
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [description, setDescription] = useState(user?.description || '');

    const background = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');

    // ✅ 防止 TS 报错：如果 user 未加载，返回 null
    if (!user) {
        return null;
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const uploadAvatar = async () => {
        if (!avatarUri) return;

        const formData = new FormData();
        formData.append('avatar', {
            uri: avatarUri,
            type: 'image/jpeg',
            name: 'avatar.jpg',
        } as any);

        try {
            const response = await axios.post(
                `${API_PREFIX}/users/upload-avatar/${user.id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const updatedUrl = response.data.avatar_url;

            // ✅ 更新全局 user 状态和本地存储
            setUser((prev) => (prev ? { ...prev, avatar_url: updatedUrl } : prev));
            await AsyncStorage.setItem('user', JSON.stringify({ ...user, avatar_url: updatedUrl }));

            Alert.alert('Success', 'Avatar updated!');
        } catch (err) {
            console.error(err);
            Alert.alert('Upload failed', 'Please try again.');
        }
    };

    const updateDescription = async () => {
        try {
            await axios.post(`${API_PREFIX}/users/update-profile/${user.id}`, {
                description,
            });

            //
            setUser((prev) => (prev ? { ...prev, description } : prev));
            await AsyncStorage.setItem('user', JSON.stringify({ ...user, description }));

            Alert.alert('Success', 'Description updated!');
        } catch (err) {
            console.error(err);
            Alert.alert('Update failed', 'Please try again.');
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: background }]}>
            <Button title="Pick an avatar" onPress={pickImage} />
            {avatarUri && <Image source={{ uri: avatarUri }} style={styles.avatar} />}
            <Button title="Upload Avatar" onPress={uploadAvatar} />

            <TextInput
                placeholder="Enter your description or phone number"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { color: text, borderColor: text }]}
                placeholderTextColor={text}
            />
            <Button title="Save Description" onPress={updateDescription} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginTop: 10 },
    input: {
        borderBottomWidth: 1,
        padding: 10,
        fontSize: 16,
    },
});
