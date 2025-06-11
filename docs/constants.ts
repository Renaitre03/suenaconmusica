
import { SoundSettings } from './types';

export const MIN_BPM = 30;
export const MAX_BPM = 300;
export const DEFAULT_BPM = 120;
export const CORPORATE_COLOR = "#23618c"; // '#23618c'
export const CORPORATE_COLOR_LIGHT = "#3b82f6"; // A lighter shade for hover/active, similar to blue-500

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  accentFrequency: 1000, // Hz
  accentGain: 1.0,      // (antes 0.8)
  mainBeatFrequency: 800, // Hz
  mainBeatGain: 0.9,     // (antes 0.7)
  subBeatFrequency: 600,  // Hz
  subBeatGain: 0.8,      // (antes 0.6)
  noteLength: 0.05, // 50ms
};

export const TAP_TEMPO_MAX_TAPS = 4;
export const TAP_TEMPO_MAX_INTERVAL_MS = 2500; // 2.5 seconds