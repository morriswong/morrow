import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants';
import { useAlarmStore, useDraftAlarmStore } from '../../stores';
import { TopNav, Button, Card, Entry, DayPicker, Slider } from '../../components/ui';
import { TimePicker, SnoozePicker } from '../../components/alarm';
import { SnoozeDuration } from '../../types';

export default function EditAlarmScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAlarm, updateAlarm, deleteAlarm } = useAlarmStore();
  const { draft, setDraft, updateDraft, clearDraft } = useDraftAlarmStore();

  useEffect(() => {
    const alarm = getAlarm(id);
    if (alarm) {
      setDraft({ ...alarm });
    } else {
      router.back();
    }
    return () => clearDraft();
  }, [id]);

  if (!draft) return null;

  const handleSave = () => {
    updateAlarm(id, draft);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAlarm(id);
            router.back();
          },
        },
      ]
    );
  };

  const handleTimeChange = (hour: number, minute: number, isAM: boolean) => {
    updateDraft({ hour, minute, isAM });
  };

  const handleDaysChange = (days: number[]) => {
    updateDraft({ repeatDays: days });
  };

  const handleSnoozeDurationChange = (duration: SnoozeDuration) => {
    updateDraft({ snoozeDuration: duration });
  };

  const handleVolumeChange = (volume: number) => {
    updateDraft({ volume });
  };

  const handleSkipHolidaysToggle = (value: boolean) => {
    updateDraft({ skipHolidays: value });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TopNav
          title="Edit Alarm"
          rightAction={
            <Button title="Save" variant="text" onPress={handleSave} />
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Time Picker */}
          <View style={styles.timePickerContainer}>
            <TimePicker
              hour={draft.hour}
              minute={draft.minute}
              isAM={draft.isAM}
              onTimeChange={handleTimeChange}
            />
          </View>

          {/* Label Input */}
          <Card style={styles.section}>
            <TextInput
              style={styles.labelInput}
              value={draft.label}
              onChangeText={(text) => updateDraft({ label: text })}
              placeholder="Alarm label"
              placeholderTextColor={colors.textTertiary}
            />
          </Card>

          {/* Repeat Days */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Repeat</Text>
            <DayPicker
              selectedDays={draft.repeatDays}
              onDaysChange={handleDaysChange}
            />
          </Card>

          {/* Skip Holidays */}
          <View style={styles.entryContainer}>
            <Entry
              variant="toggle"
              label="Skip holidays"
              sublabel={draft.skipHolidays ? 'Will skip public holidays' : undefined}
              icon={<Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />}
              value={draft.skipHolidays}
              onValueChange={handleSkipHolidaysToggle}
            />
          </View>

          {draft.skipHolidays && (
            <View style={styles.entryContainer}>
              <Entry
                variant="selection"
                label="Holiday calendar"
                value={draft.holidayCalendarId ? 'US Holidays' : 'Select'}
                icon={<Ionicons name="globe-outline" size={24} color={colors.textSecondary} />}
                onPress={() => router.push('/holidays')}
              />
            </View>
          )}

          {/* Sound Settings */}
          <View style={styles.entryContainer}>
            <Entry
              variant="selection"
              label="Sound"
              value={`${draft.soundSettings.voiceStyle === 'female' ? 'Female' : 'Male'} • ${draft.soundSettings.language}`}
              icon={<Ionicons name="musical-notes-outline" size={24} color={colors.textSecondary} />}
              onPress={() => router.push('/sound')}
            />
          </View>

          {/* Volume */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Volume</Text>
            <Slider
              value={draft.volume}
              onValueChange={handleVolumeChange}
              min={0}
              max={100}
            />
          </Card>

          {/* Snooze Duration */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Snooze duration</Text>
            <SnoozePicker
              value={draft.snoozeDuration}
              onValueChange={handleSnoozeDurationChange}
            />
          </Card>

          {/* Delete Button */}
          <View style={styles.deleteContainer}>
            <Button
              title="Delete Alarm"
              variant="danger"
              onPress={handleDelete}
              fullWidth
              icon={<Ionicons name="trash-outline" size={20} color={colors.white} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  timePickerContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelInput: {
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  entryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  deleteContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
