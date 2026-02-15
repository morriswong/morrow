import { differenceInMinutes, differenceInHours, addDays, setHours, setMinutes, isAfter, isBefore, startOfDay } from 'date-fns';
import { Platform, NativeModules } from 'react-native';
import { Alarm } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return 'Good morning 💜';
  if (hour >= 12 && hour < 18) return 'Good afternoon 💜';
  if (hour >= 18 && hour < 22) return 'Good evening 💜';
  return 'Sleep tight 💜';
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
  return {
    id: generateId(),
    label: 'Alarm',
    hour: 8,
    minute: 0,
    isAM: true,
    isEnabled: true,
    repeatDays: [],
    skipHolidays: false,
    holidayCalendarId: null,
    soundSettings: {
      voiceStyle: 'female',
      voicePersonality: 'friendly-coach',
      language: 'English',
      languageCode: 'en-GB',
    },
    volume: 70,
    snoozeDuration: 5,
  };
}

export function sortAlarmsByTimeAndDay(alarms: Alarm[]): Alarm[] {
  return [...alarms].sort((a, b) => {
    // Convert to minutes from midnight (24-hour format)
    const getMinutes = (alarm: Alarm) => {
      let hour24 = alarm.hour;
      if (alarm.isAM && alarm.hour === 12) hour24 = 0; // 12 AM = 0
      else if (!alarm.isAM && alarm.hour !== 12) hour24 = alarm.hour + 12; // PM (not 12 PM)
      return hour24 * 60 + alarm.minute;
    };

    const timeA = getMinutes(a);
    const timeB = getMinutes(b);

    // Primary sort: by time (early to late)
    if (timeA !== timeB) return timeA - timeB;

    // Secondary sort: by earliest repeatDay (Monday=0 first)
    const dayA = a.repeatDays.length > 0 ? Math.min(...a.repeatDays) : 0;
    const dayB = b.repeatDays.length > 0 ? Math.min(...b.repeatDays) : 0;
    return dayA - dayB;
  });
}

// Country code to holiday calendar ID mapping
const countryToCalendarId: Record<string, string> = {
  GB: 'uk', US: 'us', AU: 'au', BR: 'br', CA: 'ca',
  CN: 'cn', DK: 'dk', FR: 'fr', DE: 'de', HK: 'hk',
  IN: 'in', IT: 'it', JP: 'jp', KR: 'kr', LU: 'lu',
  MT: 'mt', MX: 'mx', NG: 'ng', PK: 'pk', ES: 'es',
};

function getDeviceCountryCode(): string | null {
  try {
    // Try to get locale from device
    let locale: string | null = null;

    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      const languages = settings?.AppleLanguages;
      if (languages && languages.length > 0) {
        locale = languages[0];
      }
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier;
    }

    // Fallback to Intl API
    if (!locale) {
      locale = Intl.DateTimeFormat().resolvedOptions().locale;
    }

    if (!locale) return null;

    // Extract country code from locale (e.g., "en-GB" -> "GB", "en_US" -> "US")
    const parts = locale.replace('_', '-').split('-');
    if (parts.length >= 2) {
      return parts[parts.length - 1].toUpperCase();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Determines the default holiday calendar ID when enabling skip holidays.
 * Priority: most recently used calendar from existing alarms > device locale > 'uk'
 */
export function getDefaultHolidayCalendarId(alarms: Alarm[]): string {
  // 1. Check most recently added alarm with a calendar set (search from end)
  for (let i = alarms.length - 1; i >= 0; i--) {
    if (alarms[i].holidayCalendarId != null) {
      return alarms[i].holidayCalendarId!;
    }
  }

  // 2. Try to match device locale to a calendar
  const countryCode = getDeviceCountryCode();
  if (countryCode && countryToCalendarId[countryCode]) {
    return countryToCalendarId[countryCode];
  }

  // 3. Fallback to UK Bank Holidays
  return 'uk';
}
