
export type AccentValue = 1 | 2 | 3 | 4;
export type SubdivisionValue = 1 | 2 | 3 | 4;

export interface VisualizerBeatInfo {
  lastMainBeatTime: number;
  nextMainBeatTime: number;
  mainBeatNumberForVisualizer: number;
}

export interface SoundSettings {
  accentFrequency: number;
  accentGain: number;
  mainBeatFrequency: number;
  mainBeatGain: number;
  subBeatFrequency: number;
  subBeatGain: number;
  noteLength: number; // in seconds
}
    