
import React from 'react';
import { PlayIcon, PauseIcon } from './IconComponents';
import { MIN_BPM, MAX_BPM, CORPORATE_COLOR, CORPORATE_COLOR_LIGHT } from '../constants';

interface ControlsPanelProps {
  bpm: number;
  setBpm: (bpm: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTapTempo: () => void;
  corporateColor?: string;
  corporateColorLight?: string;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  bpm,
  setBpm,
  isPlaying,
  onPlayPause,
  onTapTempo,
  corporateColor = CORPORATE_COLOR,
  corporateColorLight = CORPORATE_COLOR_LIGHT,
}) => {
  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(event.target.value, 10);
    if (newBpm >= MIN_BPM && newBpm <= MAX_BPM) {
      setBpm(newBpm);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800 p-6 rounded-lg shadow-xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <label htmlFor="bpm" className="text-xl font-semibold text-slate-300">
          BPM: <span style={{ color: corporateColor }} className="font-bold text-2xl">{bpm}</span>
        </label>
        <button
          onClick={onPlayPause}
          className={`p-3 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800`}
          style={{ backgroundColor: corporateColor, color: 'white', '--tw-ring-color': corporateColorLight } as React.CSSProperties}
          aria-label={isPlaying ? "Pause metronome" : "Play metronome"}
        >
          {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>
      </div>
      
      <input
        type="range"
        id="bpm"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        onChange={handleBpmChange}
        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
        style={{accentColor: corporateColor}}
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{MIN_BPM}</span>
        <span>{MAX_BPM}</span>
      </div>

      <button
        onClick={onTapTempo}
        className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800`}
        style={{ backgroundColor: corporateColor, '--tw-ring-color': corporateColorLight } as React.CSSProperties}
      >
        Tap Tempo
      </button>
    </div>
  );
};

export default ControlsPanel;
    