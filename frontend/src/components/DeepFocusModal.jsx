import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  'Fullscreen focus environment',
  'Tab switch detection',
  'Visible timer when tab is minimized',
  'Distraction tracking for analytics',
];

const DeepFocusModal = ({ isOpen, onEnableFocusMode, onStartNormally }) => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onStartNormally();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onStartNormally]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deep-focus-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        onClick={onStartNormally}
      />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl transition-all duration-300 ease-out"
        style={{
          backgroundColor: currentTheme.background,
          border: `2px solid ${currentTheme.border}`,
          animation: 'deepFocusModalIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes deepFocusModalIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-8px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>

        <div className="p-6 sm:p-8">
          <h2
            id="deep-focus-title"
            className="text-xl font-semibold mb-2"
            style={{ color: currentTheme.primary }}
          >
            Enable Deep Focus Mode?
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: currentTheme.text, opacity: 0.9 }}
          >
            Deep Focus Mode helps reduce distractions during the session.
          </p>
          <p className="text-xs font-medium mb-2" style={{ color: currentTheme.text, opacity: 0.85 }}>
            Features include:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-6 text-sm" style={{ color: currentTheme.text, opacity: 0.9 }}>
            {FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onEnableFocusMode}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Enable Focus Mode
            </button>
            <button
              type="button"
              onClick={onStartNormally}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.text,
                border: `2px solid ${currentTheme.border}`,
              }}
            >
              Start Normally
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepFocusModal;
