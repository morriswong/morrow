import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../../constants';
import { useDraftAlarmStore } from '../../../stores';
import { TopNav, PageTitle, SearchField } from '../../../components/ui';
import { holidayCalendars, popularCalendarIds, getHolidayCount } from './index';

interface HolidayCalendar {
  id: string;
  name: string;
  country: string;
  flag: string;
}

interface Section {
  title: string;
  data: HolidayCalendar[];
}

export default function CalendarSelectionScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useDraftAlarmStore();
  const [searchQuery, setSearchQuery] = useState('');

  if (!draft) {
    router.back();
    return null;
  }

  const handleSelectCalendar = (calendar: HolidayCalendar) => {
    updateDraft({ holidayCalendarId: calendar.id });
    router.back();
  };

  const popularCalendars = useMemo(
    () => holidayCalendars.filter((c) => popularCalendarIds.includes(c.id)),
    []
  );

  const allCalendars = useMemo(
    () =>
      holidayCalendars
        .filter((c) => !popularCalendarIds.includes(c.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const sections: Section[] = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (query.length === 0) {
      return [
        { title: 'Popular', data: popularCalendars },
        { title: 'All calendars', data: allCalendars },
      ];
    }

    const filteredPopular = popularCalendars.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query)
    );

    const filteredAll = allCalendars.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query)
    );

    const result: Section[] = [];
    if (filteredPopular.length > 0) {
      result.push({ title: 'Popular', data: filteredPopular });
    }
    if (filteredAll.length > 0) {
      result.push({ title: 'All calendars', data: filteredAll });
    }
    return result;
  }, [searchQuery, popularCalendars, allCalendars]);

  const renderCalendarItem = ({
    item,
    index,
    section,
  }: {
    item: HolidayCalendar;
    index: number;
    section: Section;
  }) => {
    const isSelected = draft.holidayCalendarId === item.id;
    const holidayCount = getHolidayCount(item.id);
    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;

    return (
      <TouchableOpacity
        style={[
          styles.calendarItem,
          isSelected && styles.calendarItemSelected,
          isFirst && styles.calendarItemFirst,
          isLast && styles.calendarItemLast,
          !isLast && styles.calendarItemBorder,
        ]}
        onPress={() => handleSelectCalendar(item)}
        activeOpacity={0.7}
      >
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>{item.flag}</Text>
        </View>
        <View style={styles.calendarInfo}>
          <Text style={styles.calendarName}>{item.name}</Text>
          <Text style={styles.holidayCount}>{holidayCount} holidays</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.white} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string };
  }) => <Text style={styles.sectionTitle}>{section.title}</Text>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav title="" />

      <SectionList
        sections={sections}
        renderItem={renderCalendarItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <PageTitle title="Calendar" />
            <View style={styles.searchContainer}>
              <SearchField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by region"
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No calendars found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    gap: spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginTop: spacing['3xl'],
    marginBottom: spacing.lg,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  calendarItemSelected: {
    backgroundColor: colors.accent,
  },
  calendarItemFirst: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  calendarItemLast: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  calendarItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  flagContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 20,
  },
  calendarInfo: {
    flex: 1,
    gap: spacing.xs + 2,
  },
  calendarName: {
    ...typography.body,
    fontFamily: 'Outfit-SemiBold',
    color: colors.textPrimary,
  },
  holidayCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
