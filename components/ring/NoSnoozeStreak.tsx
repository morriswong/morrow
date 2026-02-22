import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../constants';

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
      <View style={styles.row}>
        {/* Circles row */}
        <View style={styles.circlesRow}>
          {recentPast.map((hit, index) => (
            <View
              key={index}
              style={[styles.circle, styles.pastCircle]}
            >
              <Text style={styles.pastEmoji}>
                {hit ? '\uD83D\uDD25' : '\uD83E\uDEE5'}
              </Text>
            </View>
          ))}

          {/* Current alarm — "Now" */}
          <View style={[styles.circle, styles.nowCircle]}>
            <Text style={styles.nowEmoji}>{'\uD83D\uDD25'}</Text>
          </View>
        </View>

        {/* Labels row (invisible placeholders + visible "Now") */}
        <View style={styles.labelsRow}>
          {recentPast.map((_, index) => (
            <Text key={index} style={[styles.label, styles.labelHidden]}>
              Now
            </Text>
          ))}
          <Text style={styles.label}>Now</Text>
        </View>
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingHorizontal: 80,
    paddingVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  row: {
    gap: 4,
    alignItems: 'center',
  },
  circlesRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastCircle: {
    backgroundColor: colors.accentBrandDark,
  },
  nowCircle: {
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  pastEmoji: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.5,
  },
  nowEmoji: {
    fontSize: 18,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    width: CIRCLE_SIZE,
  },
  labelHidden: {
    opacity: 0,
  },
});
