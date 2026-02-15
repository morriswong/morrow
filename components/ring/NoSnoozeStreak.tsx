import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants';
import { DAYS_OF_WEEK } from '../../types';

interface NoSnoozeStreakProps {
  /** Day indices (0=Mon..6=Sun) where the user woke without snoozing */
  streakDays?: number[];
}

export function NoSnoozeStreak({ streakDays }: NoSnoozeStreakProps) {
  // Today as Mon=0..Sun=6
  const todayIndex = (new Date().getDay() + 6) % 7;

  // Default: all past days this week are streak days (simulates perfect week)
  const streak = streakDays ?? Array.from({ length: todayIndex }, (_, i) => i);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No-snooze days of the week</Text>
      <View style={styles.daysRow}>
        {DAYS_OF_WEEK.map((day, index) => {
          const isToday = index === todayIndex;
          const isPast = index < todayIndex;
          const hasStreak = isPast && streak.includes(index);

          if (isToday) {
            return (
              <View key={index} style={styles.todayWrapper}>
                <View style={[styles.dayCircle, styles.todayCircle]}>
                  <Text style={[styles.fireEmoji, styles.todayEmoji]}>
                    {'\uD83D\uDD25'}
                  </Text>
                </View>
                <Text style={styles.todayLabel}>Today</Text>
              </View>
            );
          }

          if (hasStreak) {
            return (
              <View key={index} style={[styles.dayCircle, styles.streakCircle]}>
                <Text style={styles.fireEmoji}>{'\uD83D\uDD25'}</Text>
              </View>
            );
          }

          if (isPast) {
            // Past day without streak (snoozed)
            return (
              <View key={index} style={[styles.dayCircle, styles.missedCircle]}>
                <Text style={styles.dayLetter}>{day}</Text>
              </View>
            );
          }

          // Future day
          return (
            <View key={index} style={[styles.dayCircle, styles.futureCircle]}>
              <Text style={styles.dayLetter}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  dayCircle: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCircle: {
    backgroundColor: colors.accent,
  },
  missedCircle: {
    backgroundColor: colors.accentBrandDark,
  },
  todayWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  todayCircle: {
    flex: 0,
    alignSelf: 'stretch',
    backgroundColor: colors.accentBrandDark,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  todayEmoji: {
    opacity: 0.5,
  },
  todayLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textPrimary,
  },
  futureCircle: {
    backgroundColor: colors.surface,
  },
  fireEmoji: {
    fontSize: 18,
    textAlign: 'center',
  },
  dayLetter: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
