import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, fontFamily, fontSize } from '../../constants';
import { Alarm, DAY_NAMES } from '../../types';
import { Toggle } from '../ui/Toggle';

interface AlarmListItemProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
  isLast?: boolean;
}

export function AlarmListItem({ alarm, onPress, onToggle, isLast = false }: AlarmListItemProps) {
  const formatTime = () => {
    // No leading zero, time and period together
    const hour = alarm.hour === 0 ? 12 : alarm.hour > 12 ? alarm.hour - 12 : alarm.hour;
    const minuteStr = alarm.minute.toString().padStart(2, '0');
    const period = alarm.isAM ? 'AM' : 'PM';
    return `${hour}:${minuteStr} ${period}`;
  };

  const formatRepeatDays = () => {
    if (alarm.repeatDays.length === 0) return 'Once';
    if (alarm.repeatDays.length === 7) return 'Every day';
    if (
      alarm.repeatDays.length === 5 &&
      alarm.repeatDays.every((d) => d >= 0 && d <= 4)
    ) {
      return 'Weekdays';
    }
    if (
      alarm.repeatDays.length === 2 &&
      alarm.repeatDays.includes(5) &&
      alarm.repeatDays.includes(6)
    ) {
      return 'Weekends';
    }
    return alarm.repeatDays.map((d) => DAY_NAMES[d].slice(0, 3)).join(', ');
  };

  const textColor = alarm.isEnabled ? colors.textPrimary : colors.textTertiary;
  const secondaryTextColor = alarm.isEnabled ? colors.textSecondary : colors.textTertiary;

  return (
    <TouchableOpacity
      style={[styles.container, !isLast && styles.withBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.time, { color: textColor }]}>
          {formatTime()}
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: secondaryTextColor }]}>{alarm.label || 'Alarm'}</Text>
          <Text style={[styles.separator, { color: secondaryTextColor }]}>•</Text>
          <Text style={[styles.repeatDays, { color: secondaryTextColor }]}>{formatRepeatDays()}</Text>
        </View>
      </View>
      <Toggle value={alarm.isEnabled} onValueChange={onToggle} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  content: {
    flex: 1,
  },
  time: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    letterSpacing: 1.2,
    lineHeight: fontSize.xl * 1.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
  },
  separator: {
    ...typography.bodySmall,
    marginHorizontal: spacing.xs,
  },
  repeatDays: {
    ...typography.bodySmall,
  },
});
