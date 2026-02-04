import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { useDraftAlarmStore } from '../../stores';
import { TopNav, PageTitle } from '../../components/ui';
import { holidayCalendars, getHolidayCount } from './index';

interface HolidayCalendar {
  id: string;
  name: string;
  country: string;
  flag: string;
}

export default function CalendarSelectionScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useDraftAlarmStore();

  if (!draft) {
    router.back();
    return null;
  }

  const handleSelectCalendar = (calendar: HolidayCalendar) => {
    updateDraft({ holidayCalendarId: calendar.id });
    router.back();
  };

  const renderCalendarItem = ({ item }: { item: HolidayCalendar }) => {
    const isSelected = draft.holidayCalendarId === item.id;
    const holidayCount = getHolidayCount(item.id);

    return (
      <TouchableOpacity
        style={[styles.calendarItem, isSelected && styles.calendarItemSelected]}
        onPress={() => handleSelectCalendar(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.calendarInfo}>
          <Text style={styles.calendarName}>{item.name}</Text>
          <Text style={styles.holidayCount}>
            {holidayCount} holidays
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav title="" />

      <PageTitle
        title="Holiday Calendar"
        subtitle="Select a calendar to use for holiday skipping"
      />

      <FlatList
        data={holidayCalendars}
        renderItem={renderCalendarItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  calendarItemSelected: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  flag: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  holidayCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  separator: {
    height: spacing.sm,
  },
});
