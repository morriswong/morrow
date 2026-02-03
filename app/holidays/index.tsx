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

interface HolidayCalendar {
  id: string;
  name: string;
  country: string;
  flag: string;
  holidayCount: number;
}

const holidayCalendars: HolidayCalendar[] = [
  { id: 'us', name: 'United States', country: 'US', flag: '🇺🇸', holidayCount: 11 },
  { id: 'uk', name: 'United Kingdom', country: 'GB', flag: '🇬🇧', holidayCount: 8 },
  { id: 'ca', name: 'Canada', country: 'CA', flag: '🇨🇦', holidayCount: 10 },
  { id: 'au', name: 'Australia', country: 'AU', flag: '🇦🇺', holidayCount: 8 },
  { id: 'de', name: 'Germany', country: 'DE', flag: '🇩🇪', holidayCount: 9 },
  { id: 'fr', name: 'France', country: 'FR', flag: '🇫🇷', holidayCount: 11 },
  { id: 'jp', name: 'Japan', country: 'JP', flag: '🇯🇵', holidayCount: 16 },
  { id: 'cn', name: 'China', country: 'CN', flag: '🇨🇳', holidayCount: 7 },
  { id: 'in', name: 'India', country: 'IN', flag: '🇮🇳', holidayCount: 21 },
  { id: 'br', name: 'Brazil', country: 'BR', flag: '🇧🇷', holidayCount: 12 },
  { id: 'mx', name: 'Mexico', country: 'MX', flag: '🇲🇽', holidayCount: 7 },
  { id: 'es', name: 'Spain', country: 'ES', flag: '🇪🇸', holidayCount: 10 },
  { id: 'it', name: 'Italy', country: 'IT', flag: '🇮🇹', holidayCount: 12 },
  { id: 'kr', name: 'South Korea', country: 'KR', flag: '🇰🇷', holidayCount: 15 },
];

export default function HolidaysScreen() {
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
            {item.holidayCount} public holidays
          </Text>
        </View>
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav title="Skip Holidays" />

      <PageTitle
        title="Holiday Calendar"
        subtitle="Select a calendar to automatically skip alarms on public holidays"
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
