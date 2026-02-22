import { VoicePersonality } from '../types';

export const VOICE_DEMO_SCRIPTS: Record<VoicePersonality, string> = {
  'friendly-coach':
    "Good morning! Let's make the best out of the day. Rise and shine!",
  'sweet-lover':
    "Good morning babe, how was your sleep? Here's a kiss to start your day, muah!",
  'loyal-servant':
    'Good morning master. Would you like a coffee to start your day please?',
  'condescending-boss':
    'You lazy piece of shit, wake the fuck up! Do you want to lose your job?',
};

export const VOICE_PITCH: Record<'female' | 'male', number> = {
  female: 1.3,
  male: 0.85,
};

export const VOICE_RATE: Record<'female' | 'male', number> = {
  female: 1.0,
  male: 0.95,
};
