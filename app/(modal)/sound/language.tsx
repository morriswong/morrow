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
import { TopNav, SearchField, PageTitle } from '../../../components/ui';

interface Language {
  code: string;
  name: string;
  region: string;
  flag: string;
}

const popularLanguageCodes = ['en-GB', 'fr-FR'];

const languages: Language[] = [
  // Popular
  { code: 'en-GB', name: 'English', region: 'United Kingdom', flag: '🇬🇧' },
  { code: 'fr-FR', name: 'French', region: 'France', flag: '🇫🇷' },
  // All languages
  { code: 'zh-HK', name: 'Cantonese', region: 'Hong Kong', flag: '🇭🇰' },
  { code: 'en-US', name: 'English', region: 'USA', flag: '🇺🇸' },
  { code: 'de-DE', name: 'German', region: 'Germany', flag: '🇩🇪' },
  { code: 'hi-IN', name: 'Hindi', region: 'India', flag: '🇮🇳' },
  { code: 'it-IT', name: 'Italian', region: 'Italy', flag: '🇮🇹' },
  { code: 'ja-JP', name: 'Japanese', region: 'Japan', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', region: 'South Korea', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Mandarin', region: 'China', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Mandarin', region: 'Taiwan', flag: '🇹🇼' },
  { code: 'pcm-NG', name: 'Pidgin English', region: 'Nigeria', flag: '🇳🇬' },
  { code: 'pt-PT', name: 'Portuguese', region: 'Portugal', flag: '🇵🇹' },
  { code: 'es-ES', name: 'Spanish', region: 'Spain', flag: '🇪🇸' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useDraftAlarmStore();
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filterFn = (lang: Language) => {
      if (!query) return true;
      return (
        lang.name.toLowerCase().includes(query) ||
        lang.region.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
      );
    };

    const popular = languages
      .filter((l) => popularLanguageCodes.includes(l.code))
      .filter(filterFn);

    const all = languages
      .filter((l) => !popularLanguageCodes.includes(l.code))
      .filter(filterFn);

    const result: { title: string; data: Language[] }[] = [];
    if (popular.length > 0) result.push({ title: 'Popular', data: popular });
    if (all.length > 0) result.push({ title: 'All languages', data: all });

    return result;
  }, [searchQuery]);

  if (!draft) {
    router.back();
    return null;
  }

  const handleSelectLanguage = (language: Language) => {
    updateDraft({
      soundSettings: {
        ...draft.soundSettings,
        language: language.name,
        languageCode: language.code,
      },
    });
    setTimeout(() => router.back(), 500);
  };

  const renderItem = ({
    item,
    index,
    section,
  }: {
    item: Language;
    index: number;
    section: { data: Language[] };
  }) => {
    const isSelected = draft.soundSettings.languageCode === item.code;
    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;

    return (
      <TouchableOpacity
        style={[
          styles.item,
          isSelected && styles.itemSelected,
          isFirst && styles.itemFirst,
          isLast && styles.itemLast,
          !isLast && styles.itemBorder,
        ]}
        onPress={() => handleSelectLanguage(item)}
        activeOpacity={0.7}
      >
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>{item.flag}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.languageName,
              isSelected && styles.textSelected,
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.languageRegion,
              isSelected && styles.regionSelected,
            ]}
          >
            {item.region}
          </Text>
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
  }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav />

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.code}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <PageTitle title="Language" />
            <View style={styles.searchContainer}>
              <SearchField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by language"
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No languages found</Text>
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
    marginBottom: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing['3xl'],
  },

  // Section headers
  sectionHeaderContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  sectionHeaderText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },

  // Items inside grouped card
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
    marginHorizontal: spacing.lg,
  },
  itemSelected: {
    backgroundColor: colors.accent,
  },
  itemFirst: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  itemLast: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },

  // Flag emoji avatar
  flagContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 20,
  },

  // Text
  textContainer: {
    flex: 1,
    gap: 6,
  },
  languageName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
  },
  languageRegion: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  textSelected: {
    color: colors.white,
  },
  regionSelected: {
    color: colors.white,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
