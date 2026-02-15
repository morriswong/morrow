import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../constants';
import { SnoozeDuration } from '../../types';

const SNOOZE_DISPLAY_OPTIONS: SnoozeDuration[] = [5, 10, 15, 30];

interface SnoozePickerProps {
  value: SnoozeDuration;
  onValueChange: (value: SnoozeDuration) => void;
}

export function SnoozePicker({ value, onValueChange }: SnoozePickerProps) {
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
            {`${duration} min`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.accent,
  },
  optionText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: colors.white,
  },
});
