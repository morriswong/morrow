import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../constants';
import { useAlarmStore } from '../stores';
import { NoSnoozeStreak } from '../components/ring/NoSnoozeStreak';
import { SlideToWake } from '../components/ring/SlideToWake';
import {
  configureAudioSession,
  playAlarmSound,
  stopAlarmSound,
  speakGreeting,
  cancelAlarmNotification,
  cancelSnoozeNotification,
  scheduleSnooze,
  scheduleAlarmNotification,
} from '../services';

function formatTime24(hour: number, minute: number, isAM: boolean): string {
  let h24 = hour;
  if (isAM && hour === 12) h24 = 0;
  else if (!isAM && hour !== 12) h24 = hour + 12;
  return `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export default function RingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAlarm, updateAlarm } = useAlarmStore();

  const alarm = id ? getAlarm(id) : undefined;
  const snoozeDuration = alarm?.snoozeDuration ?? 5;
  const isRepeatingAlarm = (alarm?.repeatDays?.length ?? 0) > 0;

  // Current time display
  const now = new Date();
  const displayLabel = alarm?.label ?? 'Alarm';
  const displayTime = alarm
    ? formatTime24(alarm.hour, alarm.minute, alarm.isAM)
    : `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Block Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  // ── Start alarm audio on mount ──────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    async function startAlarm() {
      await configureAudioSession();

      if (!alarm || !mounted) return;

      await playAlarmSound(alarm.volume);

      // Speak the personalized greeting after a short delay
      setTimeout(() => {
        if (mounted && alarm) {
          speakGreeting(alarm);
        }
      }, 2000);
    }

    startAlarm();

    return () => {
      mounted = false;
      stopAlarmSound();
    };
  }, []);

  // ── Cancel the triggering notification on mount ─────────────────────

  useEffect(() => {
    if (id) {
      cancelAlarmNotification(id);
      cancelSnoozeNotification(id);
    }
  }, [id]);

  // ── Wake up: dismiss alarm ──────────────────────────────────────────

  const handleWakeUp = useCallback(async () => {
    await stopAlarmSound();

    if (alarm) {
      if (isRepeatingAlarm) {
        // Schedule the next occurrence for repeating alarms
        await scheduleAlarmNotification(alarm);
      } else {
        // Auto-disable one-time alarms after dismissal
        updateAlarm(alarm.id, { isEnabled: false });
      }
    }

    router.replace({
      pathname: '/wakeup',
      params: { snoozed: '0' },
    });
  }, [alarm, isRepeatingAlarm, updateAlarm, router]);

  // ── Snooze: reschedule and go back to home ──────────────────────────

  const handleSnooze = useCallback(async () => {
    if (!alarm || snoozeDuration === 0) return;

    await stopAlarmSound();
    await scheduleSnooze(alarm, snoozeDuration);

    // Navigate back to home; the snooze notification will re-trigger the ring screen
    router.replace('/');
  }, [alarm, snoozeDuration, router]);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.accentBrandDark, colors.background]}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Alarm info */}
        <View style={styles.alarmInfo}>
          <Text style={styles.alarmLabel}>{displayLabel}</Text>
          <Text style={styles.timeDisplay} adjustsFontSizeToFit numberOfLines={1}>
            {displayTime}
          </Text>
        </View>

        {/* Middle: streak centered between alarm info and buttons */}
        <View style={styles.middle}>
          {isRepeatingAlarm && <NoSnoozeStreak />}
        </View>

        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          <SlideToWake onWake={handleWakeUp} />
          {snoozeDuration > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.snoozeButton,
                pressed && styles.snoozeButtonPressed,
              ]}
              onPress={handleSnooze}
            >
              <Text style={styles.snoozeText}>Snooze</Text>
            </Pressable>
          )}
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
  alarmInfo: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 14,
  },
  alarmLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
  },
  timeDisplay: {
    fontFamily: 'Outfit-Bold',
    fontSize: 106,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 6.36,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  bottomButtons: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 24,
    gap: 40,
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
  snoozeText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
  },
});
