
import React, { useState, useEffect, useRef } from 'react';
import { VisualizerBeatInfo } from '../types';
import { CORPORATE_COLOR } from '../constants';

interface VisualizerProps {
  audioContext: AudioContext | null;
  visualizerBeatInfoRef: React.RefObject<VisualizerBeatInfo>;
  isPlaying: boolean;
  corporateColor?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioContext, visualizerBeatInfoRef, isPlaying, corporateColor = CORPORATE_COLOR }) => {
  const [angle, setAngle] = useState(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const pendulumColor = corporateColor;

  useEffect(() => {
    if (!isPlaying || !audioContext || !visualizerBeatInfoRef || !visualizerBeatInfoRef.current) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      setAngle(0); // Reset angle when not playing
      return;
    }

    const animate = () => {
      if (!audioContext || !visualizerBeatInfoRef || !visualizerBeatInfoRef.current) { // Check again inside loop
         if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
         return;
      }
      const acTime = audioContext.currentTime;
      const { lastMainBeatTime, nextMainBeatTime, mainBeatNumberForVisualizer } = visualizerBeatInfoRef.current;
      
      const beatDuration = nextMainBeatTime - lastMainBeatTime;

      if (beatDuration <= 0.01) { // Avoid division by zero or extreme speeds
        // If beat duration is too short, keep pendulum at one side based on beat number
        setAngle(mainBeatNumberForVisualizer % 2 === 1 ? -30 : 30);
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(1, Math.max(0, (acTime - lastMainBeatTime) / beatDuration));
      const maxAngle = 30; // degrees

      let currentAngle;
      // mainBeatNumberForVisualizer starts at 0.
      // Beat 0 (initial state or first beat) -> swing from left extreme to right extreme
      // Beat 1 -> swing from right extreme to left extreme
      if ((mainBeatNumberForVisualizer +1) % 2 === 1) { // Odd beat (1st, 3rd actual beat) -> swing from -maxAngle to +maxAngle
          currentAngle = -maxAngle + progress * (2 * maxAngle);
      } else { // Even beat (2nd, 4th actual beat) -> swing from +maxAngle to -maxAngle
          currentAngle = maxAngle - progress * (2 * maxAngle);
      }
      
      setAngle(currentAngle);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, audioContext, visualizerBeatInfoRef]);

  return (
    <div className="w-64 h-48 bg-slate-800 rounded-lg shadow-xl p-4 flex flex-col items-center justify-end relative overflow-hidden mb-6">
      {/* Pendulum Base */}
      <div className="w-4 h-4 bg-slate-600 rounded-full absolute top-6 left-1/2 -translate-x-1/2 z-10"></div>
      {/* Pendulum Arm */}
      <div 
        className="w-1 h-32 origin-top-left absolute top-6 left-1/2"
        style={{ 
          transform: `translateX(-50%) rotate(${angle}deg)`, 
          backgroundColor: pendulumColor,
          transition: 'transform 0.05s linear' // Smooth transition for visual effect
        }}
      >
        {/* Pendulum Weight */}
        <div 
          className="w-6 h-6 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{ backgroundColor: pendulumColor }}
        ></div>
      </div>
       {/* Markings for center, left, right */}
       <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-slate-500"></div>
       <div className="absolute top-8 left-[calc(50%-35px)] -translate-x-1/2 w-0.5 h-2 bg-slate-600 rotate-[30deg] origin-bottom"></div>
       <div className="absolute top-8 left-[calc(50%+35px)] -translate-x-1/2 w-0.5 h-2 bg-slate-600 rotate-[-30deg] origin-bottom"></div>
    </div>
  );
};

export default Visualizer;
    