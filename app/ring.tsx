import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../constants';
import { useAlarmStore } from '../stores';
import { NoSnoozeStreak } from '../components/ring/NoSnoozeStreak';
import { SlideToWake } from '../components/ring/SlideToWake';

function formatTime24(hour: number, minute: number, isAM: boolean): string {
  let h24 = hour;
  if (isAM && hour === 12) h24 = 0;
  else if (!isAM && hour !== 12) h24 = hour + 12;
  return `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function addMinutesToTime(
  hour: number,
  minute: number,
  isAM: boolean,
  addMinutes: number,
): string {
  let h24 = hour;
  if (isAM && hour === 12) h24 = 0;
  else if (!isAM && hour !== 12) h24 = hour + 12;

  let totalMinutes = h24 * 60 + minute + addMinutes;
  totalMinutes = totalMinutes % (24 * 60); // wrap around midnight

  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

export default function RingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAlarm } = useAlarmStore();

  const [isSnoozed, setIsSnoozed] = useState(false);
  const [snoozeCount, setSnoozeCount] = useState(0);

  const alarm = id ? getAlarm(id) : undefined;
  const snoozeDuration = alarm?.snoozeDuration ?? 5;

  // Fallback to current time if no alarm found
  const now = new Date();
  const displayLabel = isSnoozed ? 'Ring again at' : (alarm?.label ?? 'Alarm');
  const displayTime = alarm
    ? isSnoozed
      ? addMinutesToTime(alarm.hour, alarm.minute, alarm.isAM, snoozeDuration * snoozeCount)
      : formatTime24(alarm.hour, alarm.minute, alarm.isAM)
    : `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Block Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const handleWakeUp = useCallback(() => {
    router.replace({
      pathname: '/wakeup',
      params: { snoozed: isSnoozed ? '1' : '0' },
    });
  }, [isSnoozed, router]);

  const handleSnooze = useCallback(() => {
    setSnoozeCount((prev) => prev + 1);
    setIsSnoozed(true);
  }, []);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.accentBrandDark, colors.background]}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Top content area */}
        <View style={styles.topContent}>
          <Text style={styles.alarmLabel}>{displayLabel}</Text>
          <Text style={styles.timeDisplay} adjustsFontSizeToFit numberOfLines={1}>
            {displayTime}
          </Text>
        </View>

        {/* Middle: No-snooze streak (hidden when snoozed) */}
        {!isSnoozed && (
          <View style={styles.streakContainer}>
            <NoSnoozeStreak />
          </View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          <SlideToWake onWake={handleWakeUp} />
          <Pressable
            style={({ pressed }) => [
              isSnoozed ? styles.snoozeButtonDisabled : styles.snoozeButton,
              !isSnoozed && pressed && styles.snoozeButtonPressed,
            ]}
            onPress={handleSnooze}
            disabled={isSnoozed}
          >
            <Text style={isSnoozed ? styles.snoozeTextDisabled : styles.snoozeText}>
              Snooze
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topContent: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  alarmLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  timeDisplay: {
    fontFamily: 'Outfit-Bold',
    fontSize: 106,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 6.36,
    paddingHorizontal: spacing.xl,
  },
  streakContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing['4xl'],
  },
  spacer: {
    flex: 1,
  },
  bottomButtons: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    gap: spacing['4xl'],
  },
  snoozeButton: {
    width: '100%',
    height: 67,
    borderRadius: borderRadius.full,
    backgroundColor: colors.snoozeButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeButtonPressed: {
    opacity: 0.8,
  },
  snoozeButtonDisabled: {
    width: '100%',
    height: 67,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
  },
  snoozeTextDisabled: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: '#131313',
    textAlign: 'center',
  },
});
