import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCategoryIcon, getAvailableCategories, CATEGORY_COLORS } from '../../lib/utils/categoryIcons';
import { SolanaColors, Typography, Spacing } from '../../lib/theme';

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onCategoryToggle,
  onClearAll,
  onSelectAll,
}) => {
  const categories = getAvailableCategories();
  const isAllSelected = selectedCategories.length === categories.length;
  const isNoneSelected = selectedCategories.length === 0;

  return (
    <View style={styles.container}>
      {/* Header with controls */}
      <View style={styles.header}>
        <Text style={styles.title}>Filter by Category</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={isAllSelected ? onClearAll : onSelectAll}
            style={styles.controlButton}
          >
            <Text style={styles.controlButtonText}>
              {isAllSelected ? 'Clear All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const iconName = getCategoryIcon(category);
          const categoryColor = CATEGORY_COLORS[category] || SolanaColors.primary;

          return (
            <TouchableOpacity
              key={category}
              onPress={() => onCategoryToggle(category)}
              style={[
                styles.categoryChip,
                isSelected && {
                  backgroundColor: categoryColor,
                  borderColor: categoryColor,
                }
              ]}
            >
              <Icon
                name={iconName}
                size={16}
                color={isSelected ? SolanaColors.white : categoryColor}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  isSelected && { color: SolanaColors.white }
                ]}
                numberOfLines={1}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected count */}
      <Text style={styles.selectedCount}>
        {isNoneSelected
          ? 'Showing all categories'
          : `Showing ${selectedCategories.length} of ${categories.length} categories`
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SolanaColors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.sm,
  },
  controlButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.primary,
  },
  scrollView: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingRight: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: SolanaColors.white,
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
    borderRadius: Spacing.borderRadius.md,
    minWidth: 80,
  },
  categoryIcon: {
    marginRight: Spacing.xs,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.primary,
    flexShrink: 1,
  },
  selectedCount: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
}); 