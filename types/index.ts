export type VoicePersonality = 'friendly-coach' | 'sweet-lover' | 'loyal-servant' | 'condescending-boss';

export interface SoundSettings {
  voiceStyle: 'female' | 'male';
  voicePersonality: VoicePersonality;
  language: string;
  languageCode: string;
  customRecordingUri: string | null;
}

export type FadeInDuration = 0 | 30 | 60 | 120 | 300;
export const FADE_IN_OPTIONS: FadeInDuration[] = [0, 30, 60, 120, 300];

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
  fadeInDuration: FadeInDuration;
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
