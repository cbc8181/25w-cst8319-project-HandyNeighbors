import { useEffect, useState } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { View } from 'react-native';
import useTasks from '@/hooks/useTasks';

export default function TaskMapScreen() {
    const { tasks } = useTasks();

    const [region, setRegion] = useState<Region>({
        latitude: 45.4215, // 默认中心点（渥太华）
        longitude: -75.6972,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    // 计算任务的中心点，让地图自动调整到任务密集的位置
    useEffect(() => {
        if (tasks.length > 0) {
            const avgLat = tasks.reduce((sum, task) => sum + getCoordinates(task.location).latitude, 0) / tasks.length;
            const avgLng = tasks.reduce((sum, task) => sum + getCoordinates(task.location).longitude, 0) / tasks.length;

            setRegion((prev) => ({
                ...prev,
                latitude: avgLat,
                longitude: avgLng,
            }));
        }
    }, [tasks]);

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={{ flex: 1 }}
                region={region}
                onRegionChangeComplete={setRegion} // 允许用户手动调整地图
            >
                {tasks.map((task) => {
                    const coords = getCoordinates(task.location);
                    return (
                        <Marker
                            key={task.id}
                            coordinate={coords}
                            title={task.title}
                        />
                    );
                })}
            </MapView>
        </View>
    );
}

// 解析任务的 `location` 字段
const getCoordinates = (location: any) => {
    if (typeof location === 'string' && location.startsWith('POINT')) {
        const matches = location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
        if (matches) {
            return {
                longitude: parseFloat(matches[1]),
                latitude: parseFloat(matches[2]),
            };
        }
    }
    return location; // 直接返回 { latitude, longitude } 结构
};
