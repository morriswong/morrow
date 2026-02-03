import React, { useState } from 'react';
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
import { colors, spacing, borderRadius, typography } from '../../constants';
import { useDraftAlarmStore } from '../../stores';
import { TopNav, Card, Entry, PageTitle } from '../../components/ui';

type VoiceStyle = 'female' | 'male';

const voiceStyles: { id: VoiceStyle; label: string; icon: string }[] = [
  { id: 'female', label: 'Female', icon: 'woman-outline' },
  { id: 'male', label: 'Male', icon: 'man-outline' },
];

export default function SoundScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useDraftAlarmStore();

  if (!draft) {
    router.back();
    return null;
  }

  const handleVoiceStyleChange = (style: VoiceStyle) => {
    updateDraft({
      soundSettings: {
        ...draft.soundSettings,
        voiceStyle: style,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav title="Sound" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PageTitle
          title="Wake up voice"
          subtitle="Choose the voice style for your personalized wake-up message"
        />

        {/* Voice Style Selection */}
        <View style={styles.voiceStyleContainer}>
          {voiceStyles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.voiceStyleButton,
                draft.soundSettings.voiceStyle === style.id && styles.voiceStyleButtonSelected,
              ]}
              onPress={() => handleVoiceStyleChange(style.id)}
              activeOpacity={0.7}
            >
              <View style={styles.voiceStyleIconContainer}>
                <Ionicons
                  name={style.icon as any}
                  size={32}
                  color={
                    draft.soundSettings.voiceStyle === style.id
                      ? colors.white
                      : colors.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.voiceStyleLabel,
                  draft.soundSettings.voiceStyle === style.id && styles.voiceStyleLabelSelected,
                ]}
              >
                {style.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Selection */}
        <View style={styles.entryContainer}>
          <Entry
            variant="selection"
            label="Language"
            value={draft.soundSettings.language}
            icon={<Ionicons name="language-outline" size={24} color={colors.textSecondary} />}
            onPress={() => router.push('/sound/language')}
          />
        </View>

        {/* Preview Section */}
        <Card style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Ionicons name="play-circle-outline" size={24} color={colors.accent} />
            <Text style={styles.previewTitle}>Preview</Text>
          </View>
          <Text style={styles.previewText}>
            Tap to hear a sample of your wake-up voice
          </Text>
          <TouchableOpacity style={styles.previewButton} activeOpacity={0.7}>
            <Ionicons name="play" size={20} color={colors.white} />
            <Text style={styles.previewButtonText}>Play Sample</Text>
          </TouchableOpacity>
        </Card>
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
  voiceStyleContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  voiceStyleButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  voiceStyleButtonSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceLight,
  },
  voiceStyleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  voiceStyleLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  voiceStyleLabelSelected: {
    color: colors.textPrimary,
  },
  entryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  previewCard: {
    marginHorizontal: spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  previewTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  previewText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  previewButtonText: {
    ...typography.label,
    color: colors.white,
  },
});
