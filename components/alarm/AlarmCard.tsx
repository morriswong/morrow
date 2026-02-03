import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { Alarm } from '../../types';

interface AlarmCardProps {
  alarm: Alarm;
  onPress: () => void;
  timeUntil?: string;
}

export function AlarmCard({ alarm, onPress, timeUntil }: AlarmCardProps) {
  const formatTime = () => {
    const hour = alarm.hour === 0 ? 12 : alarm.hour > 12 ? alarm.hour - 12 : alarm.hour;
    const minuteStr = alarm.minute.toString().padStart(2, '0');
    return `${hour}:${minuteStr}`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={['#6B3FA0', '#3D2066', '#2A1845']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Radial gradient overlay effect using additional gradient */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.15)', 'transparent']}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0.2, y: 1 }}
          style={styles.overlay}
        />

        {/* Header with label and countdown pill */}
        <View style={styles.header}>
          <Text style={styles.label}>{alarm.label || 'Alarm'}</Text>
          {timeUntil && (
            <View style={styles.countdownPill}>
              <Text style={styles.countdownText}>in {timeUntil}</Text>
            </View>
          )}
        </View>

        {/* Time display */}
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime()}</Text>
          <Text style={styles.period}>{alarm.isAM ? 'AM' : 'PM'}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.white,
    opacity: 0.9,
  },
  countdownPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  countdownText: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  time: {
    ...typography.displayLarge,
    color: colors.white,
    letterSpacing: -2,
  },
  period: {
    ...typography.h2,
    color: colors.white,
    marginLeft: spacing.sm,
    opacity: 0.9,
  },
});
