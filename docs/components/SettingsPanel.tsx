
import React from 'react';
import { AccentValue, SubdivisionValue } from '../types';
import { CORPORATE_COLOR } from '../constants';

interface SettingsPanelProps {
  accent: AccentValue;
  setAccent: (value: AccentValue) => void;
  subdivision: SubdivisionValue;
  setSubdivision: (value: SubdivisionValue) => void;
  corporateColor?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  accent,
  setAccent,
  subdivision,
  setSubdivision,
  corporateColor = CORPORATE_COLOR,
}) => {
  const accentOptions: AccentValue[] = [1, 2, 3, 4];
  const subdivisionOptions: SubdivisionValue[] = [1, 2, 3, 4];

  const getAccentLabel = (val: AccentValue) => {
    if (val === 1) return "Cada Tiempo"; // Every beat
    return `1 de ${val}`; // 1 of X
  };

  const getSubdivisionLabel = (val: SubdivisionValue) => {
    switch (val) {
      case 1: return "Negra (1)"; // Quarter note
      case 2: return "Corcheas (2)"; // Eighth notes
      case 3: return "Tresillos (3)"; // Triplets
      case 4: return "Semicorcheas (4)"; // Sixteenth notes
      default: return "";
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800 p-6 rounded-lg shadow-xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-300 mb-3">Acento</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {accentOptions.map((val) => (
            <button
              key={`accent-${val}`}
              onClick={() => setAccent(val)}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                accent === val ? 'text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              style={accent === val ? { backgroundColor: corporateColor, '--tw-ring-color': corporateColor } as React.CSSProperties : { '--tw-ring-color': corporateColor } as React.CSSProperties}
            >
              {getAccentLabel(val)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-3">Subdivisión</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {subdivisionOptions.map((val) => (
            <button
              key={`subdivision-${val}`}
              onClick={() => setSubdivision(val)}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                subdivision === val ? 'text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              style={subdivision === val ? { backgroundColor: corporateColor, '--tw-ring-color': corporateColor } as React.CSSProperties : { '--tw-ring-color': corporateColor } as React.CSSProperties}
            >
              {getSubdivisionLabel(val)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
    