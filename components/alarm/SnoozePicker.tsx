import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { SnoozeDuration } from '../../types';

const SNOOZE_DISPLAY_OPTIONS: SnoozeDuration[] = [5, 10, 15, 20, 0];

interface SnoozePickerProps {
  value: SnoozeDuration;
  onValueChange: (value: SnoozeDuration) => void;
}

export function SnoozePicker({ value, onValueChange }: SnoozePickerProps) {
  const formatLabel = (duration: SnoozeDuration) => {
    if (duration === 0) return 'No snooze';
    return `${duration} min`;
  };

  return (
    <View style={styles.container}>
      {SNOOZE_DISPLAY_OPTIONS.map((duration) => (
        <TouchableOpacity
          key={duration}
          style={[
            styles.option,
            value === duration && styles.optionSelected,
          ]}
          onPress={() => onValueChange(duration)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              value === duration && styles.optionTextSelected,
            ]}
          >
            {formatLabel(duration)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  optionSelected: {
    backgroundColor: colors.accent,
  },
  optionText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.white,
  },
});
