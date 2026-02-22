import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types';
import { getNextAlarmTime } from '../utils/helpers';

// ── Notification Handler (call at module scope in root layout) ──────────

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
}

// ── Notification Categories (iOS action buttons) ────────────────────────

export async function configureNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('alarm', [
    {
      identifier: 'snooze',
      buttonTitle: 'Snooze',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: { opensAppToForeground: true },
    },
  ]);
}

// ── Permissions ─────────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
      allowCriticalAlerts: false, // Requires Apple entitlement
    },
  });

  return status === 'granted';
}

// ── Schedule / Cancel ───────────────────────────────────────────────────

export async function scheduleAlarmNotification(alarm: Alarm): Promise<string | null> {
  const nextTime = getNextAlarmTime(alarm);
  if (!nextTime) return null;

  // Cancel any existing notification for this alarm
  await cancelAlarmNotification(alarm.id);

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: `alarm-${alarm.id}`,
    content: {
      title: alarm.label || 'Alarm',
      body: formatAlarmTime(alarm),
      sound: 'alarm_default.wav',
      data: { alarmId: alarm.id, type: 'alarm' },
      categoryIdentifier: 'alarm',
      ...(Platform.OS === 'android' && {
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextTime,
    },
  });

  return identifier;
}

export async function cancelAlarmNotification(alarmId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`alarm-${alarmId}`);
}

export async function scheduleSnooze(alarm: Alarm, minutes: number): Promise<string | null> {
  if (minutes <= 0) return null;

  await cancelSnoozeNotification(alarm.id);

  const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: `snooze-${alarm.id}`,
    content: {
      title: `${alarm.label || 'Alarm'} - Snoozed`,
      body: `Ringing again after ${minutes} min`,
      sound: 'alarm_default.wav',
      data: { alarmId: alarm.id, type: 'snooze' },
      categoryIdentifier: 'alarm',
      ...(Platform.OS === 'android' && {
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: snoozeTime,
    },
  });

  return identifier;
}

export async function cancelSnoozeNotification(alarmId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`snooze-${alarmId}`);
}

// ── Sync All ────────────────────────────────────────────────────────────

export async function syncAllAlarmNotifications(alarms: Alarm[]): Promise<void> {
  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule each enabled alarm
  const enabledAlarms = alarms.filter((a) => a.isEnabled);

  await Promise.all(
    enabledAlarms.map((alarm) => scheduleAlarmNotification(alarm))
  );
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ── Helpers ─────────────────────────────────────────────────────────────

function formatAlarmTime(alarm: Alarm): string {
  const h = alarm.hour.toString().padStart(2, '0');
  const m = alarm.minute.toString().padStart(2, '0');
  const period = alarm.isAM ? 'AM' : 'PM';
  return `${h}:${m} ${period}`;
}
