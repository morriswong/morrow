import { useState, useCallback, useEffect, useRef } from 'react';
import { FadeInDuration } from '../types';
import { configureAudioSession, playAlarmSound, stopAlarmSound } from '../services';

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
    await stopAlarmSound();
    setIsPreviewing(false);
  }, []);

  const togglePreview = useCallback(
    async (fadeInDuration: FadeInDuration, customUri?: string | null) => {
      if (isPreviewing) {
        await stopPreview();
        return;
      }

      await configureAudioSession();
      await playAlarmSound(fadeInDuration, customUri);
      setIsPreviewing(true);

      autoStopRef.current = setTimeout(async () => {
        await stopAlarmSound();
        setIsPreviewing(false);
        autoStopRef.current = null;
      }, PREVIEW_DURATION_MS);
    },
    [isPreviewing, stopPreview],
  );

  useEffect(() => {
    return () => {
      clearAutoStop();
      stopAlarmSound();
    };
  }, []);

  return { isPreviewing, togglePreview, stopPreview };
}
