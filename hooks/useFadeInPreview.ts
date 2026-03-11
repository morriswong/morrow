import { useState, useCallback, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { FadeInDuration, SoundSettings } from '../types';
import { configureAudioSession, playAlarmSound, stopAlarmSound } from '../services';
import { VOICE_DEMO_SCRIPTS, VOICE_PITCH, VOICE_RATE } from '../constants/voicePreview';

const PREVIEW_DURATION_MS = 8000;

export function useFadeInPreview() {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoStop = () => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  };

  const stopPreview = useCallback(async () => {
    clearAutoStop();
    await Speech.stop();
    await stopAlarmSound();
    setIsPreviewing(false);
  }, []);

  const togglePreview = useCallback(
    async (fadeInDuration: FadeInDuration, soundSettings: SoundSettings) => {
      if (isPreviewing) {
        await stopPreview();
        return;
      }

      const { customRecordingUri, voicePersonality, voiceStyle, languageCode } = soundSettings;

      if (customRecordingUri) {
        // Custom recording: play WAV with fade-in effect
        await configureAudioSession();
        await playAlarmSound(fadeInDuration, customRecordingUri);
        setIsPreviewing(true);

        autoStopRef.current = setTimeout(async () => {
          await stopAlarmSound();
          setIsPreviewing(false);
          autoStopRef.current = null;
        }, PREVIEW_DURATION_MS);
      } else {
        // No recording: preview the TTS voice personality
        const script = VOICE_DEMO_SCRIPTS[voicePersonality];
        if (!script) return;

        setIsPreviewing(true);
        Speech.speak(script, {
          language: languageCode || 'en-US',
          pitch: VOICE_PITCH[voiceStyle],
          rate: VOICE_RATE[voiceStyle],
          onDone: () => setIsPreviewing(false),
          onError: () => setIsPreviewing(false),
        });
      }
    },
    [isPreviewing, stopPreview],
  );

  useEffect(() => {
    return () => {
      clearAutoStop();
      Speech.stop();
      stopAlarmSound();
    };
  }, []);

  return { isPreviewing, togglePreview, stopPreview };
}
