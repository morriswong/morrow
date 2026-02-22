import { useState, useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { VoicePersonality } from '../types';
import { VOICE_DEMO_SCRIPTS, VOICE_PITCH, VOICE_RATE } from '../constants';

export function useVoicePreview() {
  const [playingPersonality, setPlayingPersonality] =
    useState<VoicePersonality | null>(null);

  const stopPreview = useCallback(async () => {
    await Speech.stop();
    setPlayingPersonality(null);
  }, []);

  const playPreview = useCallback(
    async (personality: VoicePersonality, voiceStyle: 'female' | 'male') => {
      // Toggle: tapping the same personality stops it
      if (playingPersonality === personality) {
        await stopPreview();
        return;
      }

      // Stop any currently playing audio
      await Speech.stop();

      const script = VOICE_DEMO_SCRIPTS[personality];
      setPlayingPersonality(personality);

      Speech.speak(script, {
        language: 'en-US',
        pitch: VOICE_PITCH[voiceStyle],
        rate: VOICE_RATE[voiceStyle],
        onDone: () => setPlayingPersonality(null),
        onError: () => setPlayingPersonality(null),
      });
    },
    [playingPersonality, stopPreview],
  );

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return { playingPersonality, playPreview, stopPreview };
}
