import React from 'react';
import { ThemeMode } from '../types/speedtest';
import { Moon, Sun, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  activeTheme: 'dark' | 'light';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  mode,
  onModeChange,
  activeTheme,
}) => {
  const cycleMode = () => {
    if (mode === 'dark') onModeChange('light');
    else if (mode === 'light') onModeChange('system');
    else onModeChange('dark');
  };

  return (
    <button
      onClick={cycleMode}
      type="button"
      title={`Theme: ${mode} (Click to switch)`}
      aria-label={`Theme mode is ${mode}`}
      className={`p-2 rounded-full border transition-all cursor-pointer ${
        activeTheme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
      }`}
    >
      {mode === 'dark' && <Moon className="w-4 h-4 text-cyan-400" />}
      {mode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
      {mode === 'system' && <Monitor className="w-4 h-4 text-slate-400" />}
    </button>
  );
};
