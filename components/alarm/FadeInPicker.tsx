import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../constants';
import { FadeInDuration, FADE_IN_OPTIONS } from '../../types';

function getFadeInLabel(duration: FadeInDuration): string {
  if (duration === 0) return 'Off';
  if (duration < 60) return `${duration}s`;
  return `${duration / 60} min`;
}

interface FadeInPickerProps {
  value: FadeInDuration;
  onValueChange: (value: FadeInDuration) => void;
}

export function FadeInPicker({ value, onValueChange }: FadeInPickerProps) {
  return (
    <View style={styles.container}>
      {FADE_IN_OPTIONS.map((duration) => (
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
            {getFadeInLabel(duration)}
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
