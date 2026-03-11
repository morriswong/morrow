import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Alarm } from '../types';
import { VOICE_DEMO_SCRIPTS, VOICE_PITCH, VOICE_RATE } from '../constants/voicePreview';

// ── Module State ────────────────────────────────────────────────────────

let currentSound: Audio.Sound | null = null;
let fadeInIntervalId: ReturnType<typeof setInterval> | null = null;
let ttsLoopTimeout: ReturnType<typeof setTimeout> | null = null;

// ── Audio Session ───────────────────────────────────────────────────────

export async function configureAudioSession(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
  });
}

// ── Alarm Sound Playback (custom recording) ─────────────────────────────

export async function playAlarmSound(fadeInDuration: number = 0, customUri: string): Promise<void> {
  try {
    await stopAlarmSound();

    const startVolume = fadeInDuration > 0 ? 0.05 : 1.0;
    const { sound } = await Audio.Sound.createAsync(
      { uri: customUri },
      { isLooping: true, volume: startVolume, shouldPlay: true },
    );

    currentSound = sound;

    if (fadeInDuration > 0) {
      const steps = 30;
      const intervalMs = (fadeInDuration * 1000) / steps;
      const volumeStep = (1.0 - startVolume) / steps;
      let currentVol = startVolume;
      fadeInIntervalId = setInterval(async () => {
        currentVol = Math.min(currentVol + volumeStep, 1.0);
        await sound.setVolumeAsync(currentVol).catch(() => {});
        if (currentVol >= 1.0) {
          clearInterval(fadeInIntervalId!);
          fadeInIntervalId = null;
        }
      }, intervalMs);
    }
  } catch (error) {
    console.warn('[audioService] Failed to play alarm sound:', error);
  }
}

// ── TTS Alarm Loop (default — no custom recording) ──────────────────────

export function playTTSAlarm(alarm: Alarm): void {
  const { voicePersonality, voiceStyle, languageCode } = alarm.soundSettings;
  const script = VOICE_DEMO_SCRIPTS[voicePersonality];
  if (!script) return;

  const speak = () => {
    Speech.speak(script, {
      language: languageCode || 'en-US',
      pitch: VOICE_PITCH[voiceStyle],
      rate: VOICE_RATE[voiceStyle],
      onDone: () => {
        ttsLoopTimeout = setTimeout(speak, 3000);
      },
      onError: () => {
        ttsLoopTimeout = setTimeout(speak, 3000);
      },
    });
  };

  speak();
}

export async function stopAlarmSound(): Promise<void> {
  try {
    if (fadeInIntervalId) {
      clearInterval(fadeInIntervalId);
      fadeInIntervalId = null;
    }

    if (ttsLoopTimeout) {
      clearTimeout(ttsLoopTimeout);
      ttsLoopTimeout = null;
    }

    await Speech.stop();

    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (error) {
    console.warn('[audioService] Failed to stop alarm sound:', error);
  }
}

// ── Voice Greeting (plays over custom recording) ─────────────────────────

export async function speakGreeting(alarm: Alarm): Promise<void> {
  const { voicePersonality, voiceStyle } = alarm.soundSettings;
  const script = VOICE_DEMO_SCRIPTS[voicePersonality];

  if (!script) return;

  // Lower alarm volume while speaking
  if (currentSound) {
    try {
      await currentSound.setVolumeAsync(0.15);
    } catch {
      // Sound may have been unloaded
    }
  }

  return new Promise<void>((resolve) => {
    Speech.speak(script, {
      language: alarm.soundSettings.languageCode || 'en-US',
      pitch: VOICE_PITCH[voiceStyle],
      rate: VOICE_RATE[voiceStyle],
      onDone: () => {
        if (currentSound) {
          currentSound.setVolumeAsync(1.0).catch(() => {});
        }
        resolve();
      },
      onError: () => resolve(),
    });
  });
}
