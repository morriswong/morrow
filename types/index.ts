export interface SoundSettings {
  voiceStyle: 'female' | 'male';
  language: string;
  languageCode: string;
}

export interface Alarm {
  id: string;
  label: string;
  hour: number;
  minute: number;
  isAM: boolean;
  isEnabled: boolean;
  repeatDays: number[]; // 0-6 for Mon-Sun
  skipHolidays: boolean;
  holidayCalendarId: string | null;
  soundSettings: SoundSettings;
  volume: number;
  snoozeDuration: 0 | 5 | 10 | 15 | 20 | 30;
}

export interface Holiday {
  date: string; // ISO date string
  name: string;
}

export interface HolidayCalendar {
  id: string;
  name: string;
  countryCode: string;
  holidays: Holiday[];
}

export type SnoozeDuration = 0 | 5 | 10 | 15 | 20 | 30;

export const SNOOZE_OPTIONS: SnoozeDuration[] = [0, 5, 10, 15, 20, 30];

export const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
