import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants';

interface NoSnoozeStreakProps {
  /**
   * Array of past ring results for this alarm (most recent last).
   * true = woke without snoozing (🔥), false = snoozed (🫥).
   * Only the most recent 4 are shown, plus the current "Now" circle.
   * If empty or undefined, only the "Now" circle is displayed (first ring).
   */
  pastResults?: boolean[];
}

export function NoSnoozeStreak({ pastResults = [] }: NoSnoozeStreakProps) {
  // Show at most the 4 most recent past results
  const recentPast = pastResults.slice(-4);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No-snooze streak</Text>
      <View style={styles.daysRow}>
        {recentPast.map((hit, index) => {
          if (hit) {
            return (
              <View key={index} style={[styles.dayCircle, styles.streakCircle]}>
                <Text style={styles.emoji}>{'\uD83D\uDD25'}</Text>
              </View>
            );
          }

          // Missed (snoozed)
          return (
            <View key={index} style={[styles.dayCircle, styles.missedCircle]}>
              <Text style={styles.emoji}>{'\uD83E\uDEE5'}</Text>
            </View>
          );
        })}

        {/* Current alarm — "Now" */}
        <View style={styles.nowWrapper}>
          <View style={[styles.dayCircle, styles.nowCircle]}>
            <Text style={[styles.emoji, styles.nowEmoji]}>
              {'\uD83D\uDD25'}
            </Text>
          </View>
          <Text style={styles.nowLabel}>Now</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingHorizontal: spacing['5xl'],
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
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
  nowWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  nowCircle: {
    flex: 0,
    alignSelf: 'stretch',
    backgroundColor: colors.accentBrandDark,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  nowEmoji: {
    opacity: 0.5,
  },
  nowLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 18,
    textAlign: 'center',
  },
});
