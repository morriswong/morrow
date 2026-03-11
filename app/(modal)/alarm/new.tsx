import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../../constants';
import { useAlarmStore, useDraftAlarmStore } from '../../../stores';
import { createDefaultAlarm } from '../../../utils';
import { TopNav, Button, Card, Entry, DayPicker, PageTitle } from '../../../components/ui';
import { TimePicker, SnoozePicker, FadeInPicker } from '../../../components/alarm';
import { SnoozeDuration, FadeInDuration } from '../../../types';
import { getDefaultHolidayCalendarId } from '../../../utils/helpers';
import { holidayCalendars, getHolidayCount } from '../holidays';
import { useNotificationPermission } from '../../../hooks/useNotificationPermission';
import { useFadeInPreview } from '../../../hooks/useFadeInPreview';

export default function NewAlarmScreen() {
  const router = useRouter();
  const { alarms, addAlarm } = useAlarmStore();
  const { ensurePermission } = useNotificationPermission();
  const { draft, setDraft, updateDraft, clearDraft } = useDraftAlarmStore();
  const { isPreviewing, togglePreview, stopPreview } = useFadeInPreview();

  useEffect(() => {
    setDraft(createDefaultAlarm());
    return () => clearDraft();
  }, []);

  // Auto-fill holiday calendar whenever skipHolidays is turned on
  useEffect(() => {
    if (draft?.skipHolidays && !draft.holidayCalendarId) {
      updateDraft({ holidayCalendarId: getDefaultHolidayCalendarId(alarms) });
    }
  }, [draft?.skipHolidays]);

  if (!draft) return null;

  const handleSave = useCallback(async () => {
    // New alarms default to enabled, so check permission
    if (draft.isEnabled) {
      const granted = await ensurePermission();
      if (!granted) return;
    }
    addAlarm(draft);
    router.back();
  }, [draft, addAlarm, ensurePermission, router]);

  const handleTimeChange = (hour: number, minute: number, isAM: boolean) => {
    updateDraft({ hour, minute, isAM });
  };

  const handleDaysChange = (days: number[]) => {
    updateDraft({ repeatDays: days });
  };

  const handleSnoozeDurationChange = (duration: SnoozeDuration) => {
    updateDraft({ snoozeDuration: duration });
  };

  const handleFadeInChange = (fadeInDuration: FadeInDuration) => {
    updateDraft({ fadeInDuration });
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

          {/* When Section */}
          <View style={styles.whenSection}>
            <Text style={styles.sectionTitle}>When</Text>
            <DayPicker
              selectedDays={draft.repeatDays}
              onDaysChange={handleDaysChange}
            />
            <Card style={styles.combinedCard}>
              <Entry
                variant="toggle"
                label="Skip holidays"
                icon={<Ionicons name="moon-outline" size={20} color={colors.accentBrandLight} />}
                iconBackgroundColor={colors.accentBrandDark}
                value={draft.skipHolidays}
                onValueChange={handleSkipHolidaysToggle}
                noBackground
                noBorderRadius
              />
              {draft.skipHolidays && (
                <View style={styles.holidaySelectorContainer}>
                  <TouchableOpacity
                    style={styles.holidaySelector}
                    onPress={() => router.push('/holidays')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.holidaySelectorText}>
                      {draft.holidayCalendarId ? (
                        <>
                          <Text style={styles.holidayCalendarName}>
                            {holidayCalendars.find(c => c.id === draft.holidayCalendarId)?.name ?? 'Select calendar'}
                          </Text>
                          <Text style={styles.holidayDot}> {'\u2022'} </Text>
                          <Text style={styles.holidayCount}>
                            {getHolidayCount(draft.holidayCalendarId)} holidays
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.holidayCalendarName}>Select calendar</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          </View>

          {/* Sound Section */}
          <View style={styles.cardContainer}>
            <Card style={styles.combinedCard}>
              <Entry
                variant="selection"
                label="Sound"
                sublabel={draft.soundSettings.customRecordingUri ? 'Custom recording' : `${draft.soundSettings.voiceStyle === 'female' ? 'Female' : 'Male'}, ${draft.soundSettings.voicePersonality.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
                icon={<Ionicons name="musical-notes-outline" size={20} color={colors.accentBrandLight} />}
                iconBackgroundColor={colors.accentBrandDark}
                onPress={() => router.push('/sound')}
                noBackground
                noBorderRadius
              />
            </Card>
          </View>

          {/* Fade In Duration */}
          <View style={styles.cardContainer}>
            <Card style={styles.snoozeCard}>
              <View style={styles.snoozeHeader}>
                <View style={styles.snoozeIconContainer}>
                  <Ionicons name="sunny-outline" size={20} color={colors.accentBrandLight} />
                </View>
                <Text style={styles.snoozeLabel}>Fade in</Text>
                <TouchableOpacity
                  onPress={() => togglePreview(draft.fadeInDuration, draft.soundSettings.customRecordingUri)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.previewButton}
                >
                  <Ionicons
                    name={isPreviewing ? 'stop' : 'play'}
                    size={20}
                    color={colors.accent}
                  />
                </TouchableOpacity>
              </View>
              <FadeInPicker
                value={draft.fadeInDuration}
                onValueChange={(d) => { stopPreview(); handleFadeInChange(d); }}
              />
            </Card>
          </View>

          {/* Snooze Duration */}
          <View style={styles.cardContainer}>
            <Card style={styles.snoozeCard}>
              <View style={styles.snoozeHeader}>
                <View style={styles.snoozeIconContainer}>
                  <Feather name="meh" size={20} color={colors.accentBrandLight} />
                </View>
                <Text style={styles.snoozeLabel}>Snooze duration</Text>
              </View>
              <SnoozePicker
                value={draft.snoozeDuration}
                onValueChange={handleSnoozeDurationChange}
              />
            </Card>
          </View>

        </ScrollView>

        {/* Fixed Save Button at Bottom */}
        <View style={styles.saveButtonContainer}>
          <Button
            title="Add alarm"
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
    paddingHorizontal: spacing.lg,
    gap: spacing['3xl'],
  },
  timePickerContainer: {
  },
  whenSection: {
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cardContainer: {
  },
  combinedCard: {
    padding: 0,
    overflow: 'hidden',
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
    flex: 1,
  },
  previewButton: {
    padding: spacing.xs,
  },
  holidaySelectorContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  holidaySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  holidaySelectorText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidayCalendarName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  holidayDot: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  holidayCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
