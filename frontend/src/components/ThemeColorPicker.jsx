import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { themeColorPalette } from '../utils/themeConfig';

const ThemeColorPicker = ({ isOpen, onClose }) => {
  const { currentTheme, customThemePrimary, setCustomThemePrimary, clearCustomTheme } = useTheme();
  const [hexInput, setHexInput] = useState('');
  const [hexError, setHexError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHexInput(customThemePrimary || '');
      setHexError('');
    }
  }, [isOpen, customThemePrimary]);

  const handlePaletteClick = (hex) => {
    setCustomThemePrimary(hex);
    setHexInput(hex);
    setHexError('');
  };

  const handleHexSubmit = (e) => {
    e.preventDefault();
    const trimmed = hexInput.trim();
    if (!trimmed) {
      clearCustomTheme();
      onClose();
      return;
    }
    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (!/^#[0-9A-Fa-f]{6}$/.test(withHash)) {
      setHexError('Enter a valid hex (e.g. #6B9B8A)');
      return;
    }
    setCustomThemePrimary(withHash);
    setHexError('');
    onClose();
  };

  const handleUseGoalDefault = () => {
    clearCustomTheme();
    setHexInput('');
    setHexError('');
    onClose();
  };

  if (!isOpen) return null;

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
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: currentTheme.primary }}>
              Customize theme color
            </h3>
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
          <p className="mb-4 text-sm" style={{ color: currentTheme.text, opacity: 0.9 }}>
            Override the goal color with your own. Saved to your account only.
          </p>

          <div className="mb-4 max-h-[220px] overflow-y-auto rounded-xl p-2" style={{ backgroundColor: currentTheme.accent }}>
            <div className="grid grid-cols-9 gap-1.5">
              {themeColorPalette.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => handlePaletteClick(hex)}
                  className="h-8 w-full rounded-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: hex,
                    boxShadow: customThemePrimary === hex ? `0 0 0 3px ${currentTheme.text}` : 'none',
                  }}
                  title={hex}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleHexSubmit} className="mb-4 flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium" style={{ color: currentTheme.text }}>
              Or enter hex:
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => { setHexInput(e.target.value); setHexError(''); }}
              placeholder="#6B9B8A"
              className="w-28 rounded-lg border-2 px-2 py-1.5 text-sm focus:outline-none"
              style={{
                borderColor: hexError ? '#dc2626' : currentTheme.border,
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
              }}
            />
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Apply
            </button>
            {hexError && <span className="w-full text-xs text-red-500">{hexError}</span>}
          </form>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUseGoalDefault}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.primary,
                border: `2px solid ${currentTheme.primary}`,
              }}
            >
              Use goal default
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeColorPicker;
