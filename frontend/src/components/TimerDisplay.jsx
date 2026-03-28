import React from 'react';
import { useTheme } from '../context/ThemeContext';

const TimerDisplay = ({ time, mode }) => {
  const { currentTheme } = useTheme();
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const modeLabel = {
    focus: 'Focus Session',
    short: 'Short Break',
    long: 'Long Break',
  }[mode];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm uppercase tracking-widest transition-colors duration-300" style={{ color: currentTheme.text }}>
        {modeLabel}
      </div>
      <div
        className="relative flex h-72 w-72 items-center justify-center rounded-full shadow-xl transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${currentTheme.background} 0%, ${currentTheme.accent}33 100%)`,
          border: `3px solid ${currentTheme.accent}`,
        }}
      >
        <div className="absolute inset-0 rounded-full opacity-30" style={{ border: `2px solid ${currentTheme.primary}` }} />
        <div className="relative flex flex-col items-center justify-center">
          <span className="text-6xl font-semibold tracking-tight transition-colors duration-300" style={{ color: currentTheme.primary }}>
            {formatted}
          </span>
          <span className="mt-2 text-sm transition-colors duration-300" style={{ color: currentTheme.text }}>
            Stay focused — one session at a time
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
