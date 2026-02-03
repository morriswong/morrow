import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants';
import { useAlarmStore } from '../stores';
import { AlarmCard, AlarmListItem } from '../components/alarm';
import { SectionTitle } from '../components/ui';
import { formatTimeUntilAlarm, getNextEnabledAlarm, sortAlarmsByTimeAndDay } from '../utils';

export default function HomeScreen() {
  const router = useRouter();
  const { alarms, toggleAlarm } = useAlarmStore();

  const nextAlarm = getNextEnabledAlarm(alarms);
  const allAlarmsSorted = sortAlarmsByTimeAndDay(alarms);

  const handleAddAlarm = () => {
    router.push('/alarm/new');
  };

  const handleEditAlarm = (id: string) => {
    router.push(`/alarm/${id}`);
  };

  const AddButton = () => (
    <TouchableOpacity
      style={styles.addButton}
      onPress={handleAddAlarm}
      activeOpacity={0.7}
    >
      <Ionicons name="add" size={20} color={colors.white} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Single personalized greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Sleep tight, Morris 💙</Text>
        </View>

        {/* Featured Alarm Card */}
        {nextAlarm && (
          <View style={styles.featuredSection}>
            <View style={styles.cardContainer}>
              <AlarmCard
                alarm={nextAlarm}
                onPress={() => handleEditAlarm(nextAlarm.id)}
                timeUntil={formatTimeUntilAlarm(nextAlarm) ?? undefined}
              />
            </View>
          </View>
        )}

        {/* All Alarms Section */}
        <View style={styles.listSection}>
          <SectionTitle title="All alarms" action={<AddButton />} />
          {allAlarmsSorted.length > 0 && (
            <View style={styles.alarmListContainer}>
              {allAlarmsSorted.map((alarm, index) => (
                <AlarmListItem
                  key={alarm.id}
                  alarm={alarm}
                  onPress={() => handleEditAlarm(alarm.id)}
                  onToggle={() => toggleAlarm(alarm.id)}
                  isLast={index === allAlarmsSorted.length - 1}
                />
              ))}
            </View>
          )}
        </View>

        {/* Empty State */}
        {alarms.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="alarm-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No alarms yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first alarm
            </Text>
          </View>
        )}
      </ScrollView>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  featuredSection: {
    marginBottom: spacing.xl,
  },
  cardContainer: {
    paddingHorizontal: spacing.lg,
  },
  listSection: {
    marginBottom: spacing.xl,
  },
  alarmListContainer: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['6xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
