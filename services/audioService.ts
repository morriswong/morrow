import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Alarm } from '../types';
import { VOICE_DEMO_SCRIPTS, VOICE_PITCH, VOICE_RATE } from '../constants/voicePreview';

// ── Module State ────────────────────────────────────────────────────────

let currentSound: Audio.Sound | null = null;

// ── Audio Session ───────────────────────────────────────────────────────

export async function configureAudioSession(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
  });
}

// ── Alarm Sound Playback ────────────────────────────────────────────────

export async function playAlarmSound(volume: number = 70): Promise<void> {
  try {
    // Stop any existing sound first
    await stopAlarmSound();

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/alarm_default.wav'),
      {
        isLooping: true,
        volume: Math.min(Math.max(volume / 100, 0), 1),
        shouldPlay: true,
      }
    );

    currentSound = sound;
  } catch (error) {
    console.warn('[audioService] Failed to play alarm sound:', error);
  }
}

export async function stopAlarmSound(): Promise<void> {
  try {
    // Stop TTS
    await Speech.stop();

    // Stop and unload audio
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (error) {
    console.warn('[audioService] Failed to stop alarm sound:', error);
  }
}

// ── Voice Greeting ──────────────────────────────────────────────────────

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
      onDone: async () => {
        // Restore alarm volume
        if (currentSound) {
          try {
            const vol = Math.min(Math.max(alarm.volume / 100, 0), 1);
            await currentSound.setVolumeAsync(vol);
          } catch {
            // Sound may have been unloaded
          }
        }
        resolve();
      },
      onError: () => resolve(),
    });
  });
}
