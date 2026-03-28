import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Session summary modal shown after a focus session ends.
 * Shows duration, focus score, distractions, and Focus Coach insight.
 */
const SessionSummaryModal = ({ isOpen, onClose, session = {}, insightMessage }) => {
  const { currentTheme } = useTheme();

  if (!isOpen) return null;

  const duration = session.duration ?? 0;
  const focusScore = session.focusScore != null ? session.focusScore : 0;
  const distractions = session.distractions ?? 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: currentTheme.background,
          border: `2px solid ${currentTheme.border}`,
          color: currentTheme.text,
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: currentTheme.primary }}>
              Session complete
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 transition-colors hover:opacity-80"
              style={{ backgroundColor: currentTheme.accent, color: currentTheme.text }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div
            className="grid grid-cols-3 gap-3 mb-5 rounded-xl p-3"
            style={{ backgroundColor: currentTheme.accent }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
                {duration}
              </p>
              <p className="text-xs" style={{ color: currentTheme.text, opacity: 0.9 }}>
                minutes
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
                {focusScore}%
              </p>
              <p className="text-xs" style={{ color: currentTheme.text, opacity: 0.9 }}>
                focus score
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
                {distractions}
              </p>
              <p className="text-xs" style={{ color: currentTheme.text, opacity: 0.9 }}>
                distractions
              </p>
            </div>
          </div>

          {insightMessage && (
            <div
              className="rounded-xl p-4 mb-4"
              style={{
                backgroundColor: `${currentTheme.primary}12`,
                border: `1px solid ${currentTheme.primary}40`,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: currentTheme.primary }}>
                Focus Coach Insight
              </p>
              <p className="text-sm leading-relaxed" style={{ color: currentTheme.text, opacity: 0.95 }}>
                {insightMessage}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-3 font-semibold text-white transition-all"
            style={{ backgroundColor: currentTheme.primary }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default SessionSummaryModal;
