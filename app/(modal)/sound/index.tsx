import React, { useRef, useState } from 'react';
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
import { Audio } from 'expo-av';
import { colors, spacing, borderRadius, typography, featureFlags } from '../../../constants';
import { useDraftAlarmStore } from '../../../stores';
import { TopNav, SectionTitle, PageTitle } from '../../../components/ui';
import { VoicePersonality } from '../../../types';
import { useVoicePreview } from '../../../hooks/useVoicePreview';
import { useRecording } from '../../../hooks/useRecording';

type VoiceStyle = 'female' | 'male';

// Map language codes to flag emojis
const languageCodeToFlag: Record<string, string> = {
  'en-GB': '🇬🇧',
  'en-US': '🇺🇸',
  'fr-FR': '🇫🇷',
  'zh-HK': '🇭🇰',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇹🇼',
  'de-DE': '🇩🇪',
  'hi-IN': '🇮🇳',
  'it-IT': '🇮🇹',
  'ja-JP': '🇯🇵',
  'ko-KR': '🇰🇷',
  'pt-PT': '🇵🇹',
  'es-ES': '🇪🇸',
  'pcm-NG': '🇳🇬',
};

const voicePersonalities: {
  id: VoicePersonality;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'friendly-coach',
    label: 'Friendly coach',
    description: 'Motivational speech to ignite your spirit',
    icon: 'flash-outline',
  },
  {
    id: 'sweet-lover',
    label: 'Sweet lover',
    description: 'Gentle words to ease you into the day',
    icon: 'heart-outline',
  },
  {
    id: 'loyal-servant',
    label: 'Loyal servant',
    description: 'Makes you feel like a royal',
    icon: 'shield-outline',
  },
  {
    id: 'condescending-boss',
    label: 'Condescending boss',
    description: 'If you need a good scolding',
    icon: 'briefcase-outline',
  },
];

export default function SoundScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useDraftAlarmStore();

  if (!draft) {
    router.back();
    return null;
  }

  const { playingPersonality, playPreview, stopPreview } = useVoicePreview();
  const { isRecording, recordingDurationMs, startRecording, stopRecording } = useRecording();
  const previewSoundRef = useRef<Audio.Sound | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const customUri = draft.soundSettings.customRecordingUri;

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopRecording = async () => {
    const uri = await stopRecording();
    if (uri) {
      updateDraft({ soundSettings: { ...draft.soundSettings, customRecordingUri: uri } });
    }
  };

  const handlePlayPreview = async () => {
    if (!customUri) return;
    if (isPlayingPreview) {
      await previewSoundRef.current?.stopAsync();
      await previewSoundRef.current?.unloadAsync();
      previewSoundRef.current = null;
      setIsPlayingPreview(false);
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: customUri },
        { shouldPlay: true }
      );
      previewSoundRef.current = sound;
      setIsPlayingPreview(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          previewSoundRef.current = null;
          setIsPlayingPreview(false);
        }
      });
    } catch (e) {
      console.warn('[SoundScreen] Failed to play preview:', e);
    }
  };

  const handleDeleteRecording = () => {
    previewSoundRef.current?.unloadAsync().catch(() => {});
    previewSoundRef.current = null;
    setIsPlayingPreview(false);
    updateDraft({ soundSettings: { ...draft.soundSettings, customRecordingUri: null } });
  };

  const handleVoiceStyleChange = (style: VoiceStyle) => {
    stopPreview();
    updateDraft({
      soundSettings: {
        ...draft.soundSettings,
        voiceStyle: style,
      },
    });
  };

  const handlePersonalityChange = (personality: VoicePersonality) => {
    if (draft.soundSettings.voicePersonality === personality) {
      playPreview(personality, draft.soundSettings.voiceStyle);
      return;
    }
    updateDraft({
      soundSettings: {
        ...draft.soundSettings,
        voicePersonality: personality,
      },
    });
    setTimeout(() => router.back(), 500);
  };

  // Map language codes to region names
  const regionMap: Record<string, string> = {
    'en-GB': 'United Kingdom',
    'en-US': 'USA',
    'fr-FR': 'France',
    'zh-HK': 'Hong Kong',
    'zh-CN': 'China',
    'zh-TW': 'Taiwan',
    'pt-PT': 'Portugal',
    'es-ES': 'Spain',
    'de-DE': 'Germany',
    'it-IT': 'Italy',
    'ja-JP': 'Japan',
    'ko-KR': 'South Korea',
    'hi-IN': 'India',
    'pcm-NG': 'Nigeria',
  };

  const getLanguageRegion = () => {
    const code = draft.soundSettings.languageCode;
    return regionMap[code] ?? (code.includes('-') ? code.split('-')[1] : '');
  };

  const getLanguageFlag = () => {
    return languageCodeToFlag[draft.soundSettings.languageCode] ?? '🌐';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <PageTitle
          title="Sound"
          subtitle="Choose a voice and wake up to a personalized message in your selected style."
        />

        {/* Language Section (feature-flagged) */}
        {featureFlags.languageSelection && (
          <>
            <SectionTitle title="Language" />
            <View style={styles.languageContainer}>
              <TouchableOpacity
                style={styles.languageEntry}
                onPress={() => router.push('/sound/language')}
                activeOpacity={0.7}
              >
                <View style={styles.languageFlagContainer}>
                  <Text style={styles.languageFlag}>{getLanguageFlag()}</Text>
                </View>
                <View style={styles.languageTextContainer}>
                  <Text style={styles.languageName}>{draft.soundSettings.language}</Text>
                  <Text style={styles.languageRegion}>{getLanguageRegion()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Alarm Sound Section */}
        <SectionTitle title="Alarm sound" />
        <View style={styles.recordingContainer}>
          <View style={[styles.recordingCard, customUri && styles.recordingCardSelected]}>
            {/* Icon */}
            <View style={[styles.recordingIconContainer, customUri && styles.recordingIconContainerSelected]}>
              <Ionicons
                name={isRecording ? 'radio-button-on' : 'mic-outline'}
                size={20}
                color={isRecording ? colors.error : customUri ? colors.white : colors.accentBrandLight}
              />
            </View>

            {/* Label */}
            <View style={styles.recordingTextContainer}>
              {isRecording ? (
                <>
                  <Text style={styles.recordingLabel}>Recording...</Text>
                  <Text style={styles.recordingDuration}>{formatDuration(recordingDurationMs)}</Text>
                </>
              ) : customUri ? (
                <>
                  <Text style={[styles.recordingLabel, styles.recordingLabelSelected]}>Your recording</Text>
                  <Text style={[styles.recordingActiveLabel, styles.recordingActiveLabelSelected]}>Active alarm sound</Text>
                </>
              ) : (
                <>
                  <Text style={styles.recordingLabel}>Default alarm sound</Text>
                  <Text style={styles.recordingDuration}>Tap record to use your own</Text>
                </>
              )}
            </View>

            {/* Actions */}
            {isRecording ? (
              <TouchableOpacity style={styles.recordingActionButton} onPress={handleStopRecording} activeOpacity={0.7}>
                <Text style={styles.recordingActionText}>Stop</Text>
              </TouchableOpacity>
            ) : customUri ? (
              <View style={styles.recordingActions}>
                <TouchableOpacity
                  style={styles.recordingActionButton}
                  onPress={handlePlayPreview}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isPlayingPreview ? 'stop' : 'play'}
                    size={16}
                    color={colors.white}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.recordingDeleteButton}
                  onPress={handleDeleteRecording}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              </View>
            ) : (
              <TouchableOpacity style={styles.recordingActionButton} onPress={startRecording} activeOpacity={0.7}>
                <Text style={styles.recordingActionText}>Record</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Voice Greeting Section */}
        <SectionTitle
          title="Voice greeting"
          action={
            <View style={styles.stylePillsContainer}>
              {(['female', 'male'] as VoiceStyle[]).map((style) => {
                const isSelected = draft.soundSettings.voiceStyle === style;
                return (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.stylePill,
                      isSelected && styles.stylePillSelected,
                    ]}
                    onPress={() => handleVoiceStyleChange(style)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.stylePillText,
                        isSelected && styles.stylePillTextSelected,
                      ]}
                    >
                      {style === 'female' ? 'Female' : 'Male'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
        />

        {/* Voice Personality List */}
        <View style={styles.personalityListContainer}>
          {voicePersonalities.map((personality, index) => {
            const isSelected = draft.soundSettings.voicePersonality === personality.id;
            const isFirst = index === 0;
            const isLast = index === voicePersonalities.length - 1;

            return (
              <TouchableOpacity
                key={personality.id}
                style={[
                  styles.personalityItem,
                  isFirst && styles.personalityItemFirst,
                  isLast && styles.personalityItemLast,
                  !isLast && styles.personalityItemBorder,
                ]}
                onPress={() => handlePersonalityChange(personality.id)}
                activeOpacity={0.7}
              >
                <View style={styles.personalityIconContainer}>
                  <Ionicons
                    name={personality.icon}
                    size={20}
                    color={colors.accentBrandLight}
                  />
                </View>
                <View style={styles.personalityTextContainer}>
                  <Text style={styles.personalityName}>
                    {personality.label}
                  </Text>
                  <Text style={styles.personalityDescription}>
                    {personality.description}
                  </Text>
                </View>
                {isSelected ? (
                  <Ionicons
                    name={playingPersonality === personality.id ? 'stop' : 'checkmark-circle'}
                    size={20}
                    color={colors.accent}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      playPreview(personality.id, draft.soundSettings.voiceStyle)
                    }
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.playButton}
                  >
                    <Ionicons
                      name={
                        playingPersonality === personality.id ? 'stop' : 'play'
                      }
                      size={20}
                      color={colors.accent}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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

  // Language Section
  languageContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  languageEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  languageFlagContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageFlag: {
    fontSize: 20,
  },
  languageTextContainer: {
    flex: 1,
    gap: 4,
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

  stylePillsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stylePill: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stylePillSelected: {
    backgroundColor: colors.accent,
  },
  stylePillText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  stylePillTextSelected: {
    color: colors.white,
  },

  // Personality List
  personalityListContainer: {
    paddingHorizontal: spacing.lg,
  },
  personalityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  personalityItemFirst: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  personalityItemLast: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  personalityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  personalityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentBrandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalityTextContainer: {
    flex: 1,
  },
  personalityName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  personalityDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playButton: {
    padding: spacing.xs,
  },

  // Custom Recording Section
  recordingContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  recordingCardSelected: {
    backgroundColor: colors.accent,
  },
  recordingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentBrandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  recordingTextContainer: {
    flex: 1,
    gap: 2,
  },
  recordingLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
  },
  recordingLabelSelected: {
    color: colors.white,
  },
  recordingDuration: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  recordingActiveLabel: {
    ...typography.bodySmall,
    color: colors.accent,
  },
  recordingActiveLabelSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  recordingActionButton: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  recordingActionText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: colors.white,
  },
  recordingDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
