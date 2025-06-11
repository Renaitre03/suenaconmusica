
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AccentValue, SubdivisionValue, VisualizerBeatInfo, SoundSettings } from './types';
import Visualizer from './components/Visualizer';
import ControlsPanel from './components/ControlsPanel';
import SettingsPanel from './components/SettingsPanel';
import { 
  MIN_BPM, MAX_BPM, DEFAULT_BPM, CORPORATE_COLOR, CORPORATE_COLOR_LIGHT, DEFAULT_SOUND_SETTINGS,
  TAP_TEMPO_MAX_TAPS, TAP_TEMPO_MAX_INTERVAL_MS
} from './constants';

const App: React.FC = () => {
  const [bpm, setBpm] = useState<number>(DEFAULT_BPM);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [accent, setAccent] = useState<AccentValue>(4);
  const [subdivision, setSubdivision] = useState<SubdivisionValue>(1);
  const [taps, setTaps] = useState<number[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const currentBeatInMeasureRef = useRef<number>(1); // For accents (1 to accentValue)
  const currentSubdivisionInBeatRef = useRef<number>(1); // For subdivisions (1 to subdivisionValue)
  const schedulerTimerIdRef = useRef<number | null>(null);
  
  const visualizerBeatInfoRef = useRef<VisualizerBeatInfo>({
    lastMainBeatTime: 0,
    nextMainBeatTime: 0,
    mainBeatNumberForVisualizer: 0,
  });

  // Refs for state values to use in useCallback without re-triggering memoization excessively
  const bpmRef = useRef(bpm);
  const accentRef = useRef(accent);
  const subdivisionRef = useRef(subdivision);
  const soundSettingsRef = useRef<SoundSettings>(DEFAULT_SOUND_SETTINGS);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { accentRef.current = accent; }, [accent]);
  useEffect(() => { subdivisionRef.current = subdivision; }, [subdivision]);

  const playSound = useCallback((
    ac: AudioContext, 
    time: number, 
    isAccentSound: boolean, 
    isMainBeatSound: boolean
  ) => {
    const settings = soundSettingsRef.current;
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();

    osc.connect(gainNode);
    gainNode.connect(ac.destination);

    if (isAccentSound) {
      osc.frequency.setValueAtTime(settings.accentFrequency, time);
      gainNode.gain.setValueAtTime(settings.accentGain, time);
    } else if (isMainBeatSound) {
      osc.frequency.setValueAtTime(settings.mainBeatFrequency, time);
      gainNode.gain.setValueAtTime(settings.mainBeatGain, time);
    } else { // Subdivision sound
      osc.frequency.setValueAtTime(settings.subBeatFrequency, time);
      gainNode.gain.setValueAtTime(settings.subBeatGain, time);
    }
    
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + settings.noteLength);
    osc.start(time);
    osc.stop(time + settings.noteLength + 0.05); // Stop slightly after gain ramp
  }, []);

  const scheduleNotes = useCallback(() => {
    if (!audioContextRef.current) return;

    const ac = audioContextRef.current;
    const currentTime = ac.currentTime;
    const scheduleAheadTime = 0.1; // 100ms

    while (nextNoteTimeRef.current < currentTime + scheduleAheadTime) {
      const beatTime = nextNoteTimeRef.current;
      const isMainBeat = currentSubdivisionInBeatRef.current === 1;
      const isAccentSound = isMainBeat && currentBeatInMeasureRef.current === 1;

      playSound(ac, beatTime, isAccentSound, isMainBeat);

      if (isMainBeat) {
        const secondsPerMainBeat = 60.0 / bpmRef.current;
        visualizerBeatInfoRef.current = {
          lastMainBeatTime: beatTime,
          nextMainBeatTime: beatTime + secondsPerMainBeat,
          mainBeatNumberForVisualizer: visualizerBeatInfoRef.current.mainBeatNumberForVisualizer + 1,
        };
      }

      // Advance time and counters
      const secondsPerMainBeat = 60.0 / bpmRef.current;
      const secondsPerSubdivision = secondsPerMainBeat / subdivisionRef.current;
      nextNoteTimeRef.current += secondsPerSubdivision;

      currentSubdivisionInBeatRef.current++;
      if (currentSubdivisionInBeatRef.current > subdivisionRef.current) {
        currentSubdivisionInBeatRef.current = 1;
        currentBeatInMeasureRef.current++;
        if (currentBeatInMeasureRef.current > accentRef.current) {
          currentBeatInMeasureRef.current = 1;
        }
      }
    }
  }, [playSound]); // bpmRef, subdivisionRef, accentRef are used via .current

  const startMetronome = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ac = audioContextRef.current;
    if (ac.state === 'suspended') {
      ac.resume();
    }

    currentBeatInMeasureRef.current = 1;
    currentSubdivisionInBeatRef.current = 1;
    // Start scheduling slightly in the future to ensure everything is initialized
    nextNoteTimeRef.current = ac.currentTime + 0.05; 
    
    const initialSecondsPerMainBeat = 60.0 / bpmRef.current;
    visualizerBeatInfoRef.current = {
        lastMainBeatTime: ac.currentTime,
        nextMainBeatTime: ac.currentTime + initialSecondsPerMainBeat,
        mainBeatNumberForVisualizer: 0,
    };
    
    if (schedulerTimerIdRef.current) {
      clearInterval(schedulerTimerIdRef.current);
    }
    schedulerTimerIdRef.current = window.setInterval(scheduleNotes, 25); // Schedule every 25ms
  }, [scheduleNotes]);

  const stopMetronome = useCallback(() => {
    if (schedulerTimerIdRef.current) {
      clearInterval(schedulerTimerIdRef.current);
      schedulerTimerIdRef.current = null;
    }
    // Optionally suspend AudioContext after a delay if not used
    // if (audioContextRef.current && audioContextRef.current.state === 'running') {
    //   setTimeout(() => {
    //     if (!isPlaying && audioContextRef.current) audioContextRef.current.suspend();
    //   }, 3000); // Suspend after 3s of inactivity
    // }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startMetronome();
    } else {
      stopMetronome();
    }
    // This effect should only re-run if isPlaying changes, or if start/stop logic changes.
    // Explicitly disabling exhaustive-deps because startMetronome/stopMetronome themselves
    // are memoized and contain the necessary logic. Re-running this effect on bpm/accent/subdivision
    // changes while playing is handled by restarting the metronome if needed (though current structure
    // uses refs to avoid restart on every minor param change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, startMetronome, stopMetronome]);


  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTapTempo = () => {
    const now = performance.now();
    const newTaps = [...taps];

    if (newTaps.length > 0 && now - newTaps[newTaps.length - 1] > TAP_TEMPO_MAX_INTERVAL_MS) {
      newTaps.length = 0; // Reset if tap is too late
    }

    newTaps.push(now);
    if (newTaps.length > TAP_TEMPO_MAX_TAPS) {
      newTaps.shift();
    }
    setTaps(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const averageInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      if (averageInterval > 0) {
        const newBpm = Math.round(60000 / averageInterval);
        setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, newBpm)));
      }
    }
  };

  const handleSetBpm = (newBpm: number) => {
    setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, newBpm)));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-pink-500 selection:text-white">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <header className="mb-8 text-center">
          <img
            src="image.png" // Changed path to relative
            alt="Suena con Música Logo"
            className="mx-auto mb-6 w-48 h-auto sm:w-60 md:w-72" // Responsive width
          />
          <h1 className="text-4xl sm:text-5xl font-bold" style={{color: CORPORATE_COLOR_LIGHT}}>Metrónomo Moderno</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">Tu herramienta precisa para el ritmo perfecto.</p>
        </header>
        
        <Visualizer 
          audioContext={audioContextRef.current} 
          visualizerBeatInfoRef={visualizerBeatInfoRef}
          isPlaying={isPlaying}
          corporateColor={CORPORATE_COLOR}
        />
        
        <ControlsPanel
          bpm={bpm}
          setBpm={handleSetBpm}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onTapTempo={handleTapTempo}
          corporateColor={CORPORATE_COLOR}
          corporateColorLight={CORPORATE_COLOR_LIGHT}
        />
        
        <SettingsPanel
          accent={accent}
          setAccent={setAccent}
          subdivision={subdivision}
          setSubdivision={setSubdivision}
          corporateColor={CORPORATE_COLOR}
        />
        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>Construido con React, TypeScript y Tailwind CSS.</p>
          <p>Color corporativo: <span style={{color: CORPORATE_COLOR, fontWeight: 'bold'}}>{CORPORATE_COLOR}</span></p>
        </footer>
      </div>
    </div>
  );
};

export default App;
