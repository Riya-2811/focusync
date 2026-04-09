import React from 'react';

const ThemeSettings = ({ theme, mode, onModeChange }) => {
  const options = [
    { id: 'light', label: 'Light mode', icon: '☀️' },
    { id: 'dark', label: 'Dark mode', icon: '🌙' },
    { id: 'system', label: 'System theme', icon: '🖥️' },
  ];

  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}>
      <h2 className="text-xl font-semibold mb-1" style={{ color: theme.primary }}>Theme & Appearance</h2>
      <p className="text-sm mb-5" style={{ color: theme.text, opacity: 0.8 }}>
        Pick how FOCUSYNC should look. Your preference is stored locally.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onModeChange(option.id)}
            className="rounded-xl px-4 py-3 text-left border transition-all duration-200 hover:opacity-90"
            style={
              mode === option.id
                ? { borderColor: theme.primary, backgroundColor: `${theme.primary}20`, color: theme.primary }
                : { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }
            }
          >
            <span className="mr-2" aria-hidden>{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ThemeSettings;
