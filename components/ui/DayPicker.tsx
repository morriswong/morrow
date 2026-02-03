import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { DAYS_OF_WEEK } from '../../types';

interface DayPickerProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

export function DayPicker({ selectedDays, onDaysChange }: DayPickerProps) {
  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      onDaysChange(selectedDays.filter((d) => d !== dayIndex));
    } else {
      onDaysChange([...selectedDays, dayIndex].sort());
    }
  };

  return (
    <View style={styles.container}>
      {DAYS_OF_WEEK.map((day, index) => {
        const isSelected = selectedDays.includes(index);
        return (
          <TouchableOpacity
            key={index}
            style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
            onPress={() => toggleDay(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
              {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.accent,
  },
  dayText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  dayTextSelected: {
    color: colors.white,
  },
});
