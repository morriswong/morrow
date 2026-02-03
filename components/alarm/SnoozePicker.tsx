import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { SnoozeDuration, SNOOZE_OPTIONS } from '../../types';

interface SnoozePickerProps {
  value: SnoozeDuration;
  onValueChange: (value: SnoozeDuration) => void;
}

export function SnoozePicker({ value, onValueChange }: SnoozePickerProps) {
  const formatLabel = (duration: SnoozeDuration) => {
    if (duration === 0) return 'Off';
    return `${duration} min`;
  };

  return (
    <View style={styles.container}>
      {SNOOZE_OPTIONS.map((duration) => (
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
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
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
