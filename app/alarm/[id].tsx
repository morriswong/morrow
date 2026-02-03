import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants';
import { useAlarmStore, useDraftAlarmStore } from '../../stores';
import { TopNav, Button, Card, Entry, DayPicker, Slider, PageTitle } from '../../components/ui';
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

  const handleToggleEnabled = (value: boolean) => {
    updateDraft({ isEnabled: value });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TopNav variant="close" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Page Title with Toggle */}
          <PageTitle
            title={draft.label}
            showEditIcon
            editable
            onTitleChange={(text) => updateDraft({ label: text })}
            placeholder="Alarm"
            showToggle
            toggleValue={draft.isEnabled}
            onToggleChange={handleToggleEnabled}
          />

          {/* Time Picker */}
          <View style={styles.timePickerContainer}>
            <TimePicker
              hour={draft.hour}
              minute={draft.minute}
              isAM={draft.isAM}
              onTimeChange={handleTimeChange}
            />
          </View>

          {/* When Section - Day Picker */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>When</Text>
          </View>
          <View style={styles.dayPickerContainer}>
            <DayPicker
              selectedDays={draft.repeatDays}
              onDaysChange={handleDaysChange}
            />
          </View>

          {/* Skip Holidays Card */}
          <View style={styles.cardContainer}>
            <Card style={styles.combinedCard}>
              <Entry
                variant="toggle"
                label="Skip holidays"
                sublabel={draft.skipHolidays ? 'Will skip public holidays' : undefined}
                icon={<Ionicons name="calendar-outline" size={20} color={colors.white} />}
                iconBackgroundColor={colors.accentBrandDark}
                value={draft.skipHolidays}
                onValueChange={handleSkipHolidaysToggle}
                noBackground
                noBorderRadius
              />
              {draft.skipHolidays && (
                <Entry
                  variant="selection"
                  label="Holiday calendar"
                  value={draft.holidayCalendarId ? 'US Holidays' : 'Select'}
                  onPress={() => router.push('/holidays')}
                  noBackground
                  noBorderRadius
                />
              )}
            </Card>
          </View>

          {/* Sound Section */}
          <View style={styles.cardContainer}>
            <Card style={styles.combinedCard}>
              <Entry
                variant="selection"
                label="Sound"
                sublabel={`${draft.soundSettings.voiceStyle === 'female' ? 'Female' : 'Male'} voice`}
                icon={<Ionicons name="musical-notes-outline" size={20} color={colors.white} />}
                iconBackgroundColor={colors.accentBrandDark}
                onPress={() => router.push('/sound')}
                noBackground
                noBorderRadius
              />
              <View style={styles.sliderContainer}>
                <Slider
                  value={draft.volume}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={100}
                  showIcons
                />
              </View>
            </Card>
          </View>

          {/* Snooze Duration */}
          <View style={styles.cardContainer}>
            <Card style={styles.snoozeCard}>
              <View style={styles.snoozeHeader}>
                <View style={styles.snoozeIconContainer}>
                  <Ionicons name="alarm-outline" size={20} color={colors.white} />
                </View>
                <Text style={styles.snoozeLabel}>Snooze duration</Text>
              </View>
              <SnoozePicker
                value={draft.snoozeDuration}
                onValueChange={handleSnoozeDurationChange}
              />
            </Card>
          </View>

          {/* Delete Button */}
          <View style={styles.deleteButtonContainer}>
            <Button
              title="Delete alarm"
              variant="dangerOutline"
              onPress={handleDelete}
              fullWidth
            />
          </View>
        </ScrollView>

        {/* Fixed Save Button at Bottom */}
        <View style={styles.saveButtonContainer}>
          <Button
            title="Save"
            variant="accentTranslucent"
            onPress={handleSave}
            fullWidth
          />
        </View>
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
    paddingBottom: 100,
  },
  timePickerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitleContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  dayPickerContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  combinedCard: {
    padding: 0,
    overflow: 'hidden',
  },
  sliderContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  snoozeCard: {
    padding: spacing.lg,
  },
  snoozeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  snoozeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentBrandDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  snoozeLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  deleteButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
});
