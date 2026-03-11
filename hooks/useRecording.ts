import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  async function startRecording(): Promise<void> {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      // Put iOS audio session into recording mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDurationMs(0);

      timerRef.current = setInterval(() => {
        setRecordingDurationMs((prev) => prev + 1000);
      }, 1000);
    } catch (error) {
      console.warn('[useRecording] Failed to start recording:', error);
    }
  }

  async function stopRecording(): Promise<string | null> {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (!recordingRef.current) return null;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      // Restore audio session for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      return uri ?? null;
    } catch (error) {
      console.warn('[useRecording] Failed to stop recording:', error);
      setIsRecording(false);
      return null;
    }
  }

  return { isRecording, recordingDurationMs, startRecording, stopRecording };
}
