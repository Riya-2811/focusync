import React from 'react';
import { useTheme } from '../context/ThemeContext';

const TimerControls = ({ isRunning, onStart, onResume, onPause, onReset, onModeChange, mode, secondsLeft, durationForMode }) => {
  const { currentTheme } = useTheme();
  const canResume = !isRunning && durationForMode != null && secondsLeft < durationForMode;
  const pauseResumeLabel = isRunning ? 'Pause' : (canResume ? 'Resume' : 'Pause');
  const pauseResumeDisabled = !isRunning && !canResume;
  const handlePauseResumeClick = isRunning ? onPause : (canResume ? onResume : undefined);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex gap-3">
        <button
          onClick={onStart}
          disabled={isRunning}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow transition-all duration-300 ease-out"
          style={{
            backgroundColor: currentTheme.primary,
            opacity: isRunning ? 0.5 : 1,
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          Start
        </button>
        <button
          onClick={handlePauseResumeClick}
          disabled={pauseResumeDisabled}
          className="rounded-xl px-6 py-3 text-sm font-semibold shadow transition-all duration-300 ease-out"
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.text,
            opacity: pauseResumeDisabled ? 0.5 : 1,
            cursor: pauseResumeDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {pauseResumeLabel}
        </button>
        <button
          onClick={onReset}
          className="rounded-xl px-6 py-3 text-sm font-semibold shadow transition-all duration-300 ease-out"
          style={{
            backgroundColor: currentTheme.background,
            color: currentTheme.text,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => onModeChange('focus')}
          className="rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ease-out"
          style={{
            backgroundColor: mode === 'focus' ? currentTheme.primary : currentTheme.background,
            color: mode === 'focus' ? 'white' : currentTheme.text,
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          Focus
        </button>
        <button
          onClick={() => onModeChange('short')}
          className="rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ease-out"
          style={{
            backgroundColor: mode === 'short' ? currentTheme.primary : currentTheme.background,
            color: mode === 'short' ? 'white' : currentTheme.text,
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          Short Break
        </button>
        <button
          onClick={() => onModeChange('long')}
          className="rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ease-out"
          style={{
            backgroundColor: mode === 'long' ? currentTheme.primary : currentTheme.background,
            color: mode === 'long' ? 'white' : currentTheme.text,
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          Long Break
        </button>
      </div>
    </div>
  );
};

export default TimerControls;
