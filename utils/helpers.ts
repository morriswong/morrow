import { differenceInMinutes, differenceInHours, addDays, setHours, setMinutes, isAfter, isBefore, startOfDay } from 'date-fns';
import { Alarm } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatTimeUntilAlarm(alarm: Alarm): string | null {
  if (!alarm.isEnabled) return null;

  const now = new Date();
  const alarmTime = getNextAlarmTime(alarm);

  if (!alarmTime) return null;

  const diffMinutes = differenceInMinutes(alarmTime, now);
  const diffHours = differenceInHours(alarmTime, now);

  if (diffMinutes < 1) return 'less than a minute';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  if (diffHours < 24) {
    const remainingMinutes = diffMinutes % 60;
    if (remainingMinutes === 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    return `${diffHours}h ${remainingMinutes}m`;
  }

  const days = Math.floor(diffHours / 24);
  const hours = diffHours % 24;
  if (hours === 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  return `${days}d ${hours}h`;
}

export function getNextAlarmTime(alarm: Alarm): Date | null {
  if (!alarm.isEnabled) return null;

  const now = new Date();
  let alarmHour = alarm.hour;

  // Convert to 24-hour format
  if (!alarm.isAM && alarm.hour !== 12) {
    alarmHour = alarm.hour + 12;
  } else if (alarm.isAM && alarm.hour === 12) {
    alarmHour = 0;
  }

  // Start with today
  let alarmDate = setMinutes(setHours(startOfDay(now), alarmHour), alarm.minute);

  // If alarm time has passed today, start checking from tomorrow
  if (isBefore(alarmDate, now)) {
    alarmDate = addDays(alarmDate, 1);
  }

  // If no repeat days, return the next occurrence
  if (alarm.repeatDays.length === 0) {
    return alarmDate;
  }

  // Find the next matching day
  for (let i = 0; i < 7; i++) {
    const checkDate = addDays(alarmDate, i);
    const dayOfWeek = (checkDate.getDay() + 6) % 7; // Convert to Mon=0, Sun=6

    if (alarm.repeatDays.includes(dayOfWeek)) {
      // Only return if it's in the future
      const candidateDate = setMinutes(setHours(startOfDay(checkDate), alarmHour), alarm.minute);
      if (isAfter(candidateDate, now)) {
        return candidateDate;
      }
    }
  }

  return alarmDate;
}

export function getNextEnabledAlarm(alarms: Alarm[]): Alarm | null {
  const enabledAlarms = alarms.filter((a) => a.isEnabled);
  if (enabledAlarms.length === 0) return null;

  let nextAlarm: Alarm | null = null;
  let nextTime: Date | null = null;

  for (const alarm of enabledAlarms) {
    const alarmTime = getNextAlarmTime(alarm);
    if (alarmTime && (!nextTime || isBefore(alarmTime, nextTime))) {
      nextTime = alarmTime;
      nextAlarm = alarm;
    }
  }

  return nextAlarm;
}

export function createDefaultAlarm(): Alarm {
  const now = new Date();
  let hour = now.getHours();
  const isAM = hour < 12;

  // Convert to 12-hour format
  if (hour === 0) hour = 12;
  else if (hour > 12) hour = hour - 12;

  return {
    id: generateId(),
    label: 'Alarm',
    hour,
    minute: 0,
    isAM,
    isEnabled: true,
    repeatDays: [],
    skipHolidays: false,
    holidayCalendarId: null,
    soundSettings: {
      voiceStyle: 'female',
      language: 'English',
      languageCode: 'en-US',
    },
    volume: 70,
    snoozeDuration: 5,
  };
}
