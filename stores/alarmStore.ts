import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, SnoozeDuration, SoundSettings } from '../types';
import { generateId, createDefaultAlarm } from '../utils/helpers';

const seedAlarms: Alarm[] = [
  {
    id: 'seed-work',
    label: 'Work',
    hour: 8,
    minute: 0,
    isAM: true,
    isEnabled: false,
    repeatDays: [0, 1, 2, 3, 4], // Mon-Fri
    skipHolidays: true,
    holidayCalendarId: 'uk',
    soundSettings: {
      voiceStyle: 'male',
      voicePersonality: 'friendly-coach',
      language: 'English',
      languageCode: 'en-GB',
    },
    volume: 70,
    snoozeDuration: 5,
  },
  {
    id: 'seed-weekend',
    label: 'Weekend chill',
    hour: 10,
    minute: 0,
    isAM: true,
    isEnabled: false,
    repeatDays: [5, 6], // Sat-Sun
    skipHolidays: false,
    holidayCalendarId: null,
    soundSettings: {
      voiceStyle: 'male',
      voicePersonality: 'sweet-lover',
      language: 'French',
      languageCode: 'fr-FR',
    },
    volume: 70,
    snoozeDuration: 30,
  },
];

interface AlarmState {
  alarms: Alarm[];

  // Actions
  addAlarm: (alarm?: Partial<Alarm>) => Alarm;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  getAlarm: (id: string) => Alarm | undefined;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: seedAlarms,

      addAlarm: (partial) => {
        const newAlarm: Alarm = {
          ...createDefaultAlarm(),
          ...partial,
          id: generateId(),
        };

        set((state) => ({
          alarms: [...state.alarms, newAlarm],
        }));

        return newAlarm;
      },

      updateAlarm: (id, updates) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, ...updates } : alarm
          ),
        }));
      },

      deleteAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        }));
      },

      toggleAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, isEnabled: !alarm.isEnabled } : alarm
          ),
        }));
      },

      getAlarm: (id) => {
        return get().alarms.find((alarm) => alarm.id === id);
      },
    }),
    {
      name: 'morrow-alarms',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Add voicePersonality to existing alarms that don't have it
          if (persistedState.alarms) {
            persistedState.alarms = persistedState.alarms.map((alarm: any) => ({
              ...alarm,
              soundSettings: {
                ...alarm.soundSettings,
                voicePersonality: alarm.soundSettings?.voicePersonality ?? 'sweet-lover',
              },
            }));
          }
        }
        if (version < 2) {
          // Add seed alarms if user has no alarms
          if (!persistedState.alarms || persistedState.alarms.length === 0) {
            persistedState.alarms = seedAlarms;
          }
        }
        return persistedState as AlarmState;
      },
    }
  )
);

// Draft alarm store for editing (not persisted)
interface DraftAlarmState {
  draft: Alarm | null;

  setDraft: (alarm: Alarm) => void;
  updateDraft: (updates: Partial<Alarm>) => void;
  clearDraft: () => void;
}

export const useDraftAlarmStore = create<DraftAlarmState>((set) => ({
  draft: null,

  setDraft: (alarm) => set({ draft: alarm }),

  updateDraft: (updates) =>
    set((state) => ({
      draft: state.draft ? { ...state.draft, ...updates } : null,
    })),

  clearDraft: () => set({ draft: null }),
}));
