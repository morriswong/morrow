import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, SnoozeDuration, SoundSettings } from '../types';
import { generateId, createDefaultAlarm } from '../utils/helpers';

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
      alarms: [],

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
