import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { TopNav, PageTitle, Card } from '../../components/ui';

interface Holiday {
  date: string;
  name: string;
}

const holidaysByCalendar: Record<string, Holiday[]> = {
  us: [
    { date: '2024-01-01', name: "New Year's Day" },
    { date: '2024-01-15', name: 'Martin Luther King Jr. Day' },
    { date: '2024-02-19', name: "Presidents' Day" },
    { date: '2024-05-27', name: 'Memorial Day' },
    { date: '2024-06-19', name: 'Juneteenth' },
    { date: '2024-07-04', name: 'Independence Day' },
    { date: '2024-09-02', name: 'Labor Day' },
    { date: '2024-10-14', name: 'Columbus Day' },
    { date: '2024-11-11', name: 'Veterans Day' },
    { date: '2024-11-28', name: 'Thanksgiving Day' },
    { date: '2024-12-25', name: 'Christmas Day' },
  ],
  uk: [
    { date: '2024-01-01', name: "New Year's Day" },
    { date: '2024-03-29', name: 'Good Friday' },
    { date: '2024-04-01', name: 'Easter Monday' },
    { date: '2024-05-06', name: 'Early May Bank Holiday' },
    { date: '2024-05-27', name: 'Spring Bank Holiday' },
    { date: '2024-08-26', name: 'Summer Bank Holiday' },
    { date: '2024-12-25', name: 'Christmas Day' },
    { date: '2024-12-26', name: 'Boxing Day' },
  ],
};

export default function CalendarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const holidays = holidaysByCalendar[id] || holidaysByCalendar.us;

  const renderHolidayItem = ({ item }: { item: Holiday }) => {
    const date = parseISO(item.date);
    const formattedDate = format(date, 'EEEE, MMMM d');

    return (
      <View style={styles.holidayItem}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateDay}>{format(date, 'd')}</Text>
          <Text style={styles.dateMonth}>{format(date, 'MMM')}</Text>
        </View>
        <View style={styles.holidayInfo}>
          <Text style={styles.holidayName}>{item.name}</Text>
          <Text style={styles.holidayDate}>{formattedDate}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav title="Holidays" />

      <PageTitle
        title="Public Holidays"
        subtitle="These holidays will be skipped when enabled"
      />

      <FlatList
        data={holidays}
        renderItem={renderHolidayItem}
        keyExtractor={(item) => item.date}
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
  holidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  dateContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateDay: {
    ...typography.h2,
    color: colors.accent,
  },
  dateMonth: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  holidayInfo: {
    flex: 1,
  },
  holidayName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  holidayDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  separator: {
    height: spacing.sm,
  },
});
