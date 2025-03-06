import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';

// Category icons mapping - using EXACT filenames from assets folder
const CATEGORY_ICONS: Record<string, any> = {
  gardening: require('../assets/images/lawning.jpg'),
  cleaning: require('../assets/images/carcleaning.jpg'),
  repairs: require('../assets/images/tool.jpg'),
  delivery: require('../assets/images/delivery.jpg'),
  snow: require('../assets/images/snowshovel.jpg'),
  // Using the corrected tutoring image filename
  tutoring: require('../assets/images/tutoring.jpg'),
  // Fallback to Ionicons for other categories
  default: 'apps-outline'
};

export interface Category {
  id: string;
  name: string;
  icon: string;  // This could be an Ionicons name or a key to our custom images
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategorySelector({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategorySelectorProps) {
  
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item.id;
    
    // Determine if we should use a custom image or Ionicons
    const useCustomIcon = CATEGORY_ICONS[item.id.toLowerCase()] && 
                        typeof CATEGORY_ICONS[item.id.toLowerCase()] !== 'string';

    return (
      <TouchableOpacity 
        style={[
          styles.categoryItem,
          isSelected && styles.selectedCategory
        ]}
        onPress={() => onSelectCategory(isSelected ? null : item.id)}
      >
        <View style={styles.categoryIcon}>
          {useCustomIcon ? (
            <Image 
              source={CATEGORY_ICONS[item.id.toLowerCase()]} 
              style={styles.iconImage} 
              resizeMode="cover"
            />
          ) : (
            <Ionicons 
              name={CATEGORY_ICONS[item.id.toLowerCase()] || CATEGORY_ICONS.default as any} 
              size={24} 
              color={isSelected ? '#fff' : '#000'} 
            />
          )}
        </View>
        <ThemedText style={[
          styles.categoryName,
          isSelected && styles.selectedCategoryText
        ]}>
          {item.name}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={categories}
      renderItem={renderCategoryItem}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesList}
    />
  );
}

const styles = StyleSheet.create({
  categoriesList: {
    paddingRight: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  selectedCategory: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 8,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
}); 