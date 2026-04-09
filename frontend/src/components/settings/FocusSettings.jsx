import React from 'react';

const Toggle = ({ checked, onChange, label, theme }) => (
  <label className="flex items-center justify-between gap-3 py-2">
    <span className="text-sm font-medium" style={{ color: theme.text }}>{label}</span>
    <button
      type="button"
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{ backgroundColor: checked ? theme.primary : theme.border }}
      aria-pressed={checked}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  </label>
);

const FocusSettings = ({ theme, values, onChange }) => {
  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}>
      <h2 className="text-xl font-semibold mb-1" style={{ color: theme.primary }}>Focus Preferences</h2>
      <p className="text-sm mb-5" style={{ color: theme.text, opacity: 0.8 }}>
        Configure how focus sessions and breaks behave by default.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: theme.text }}>Default focus length (minutes)</label>
          <input type="number" min="10" max="180" value={values.focusMinutes} onChange={(e) => onChange('focusMinutes', Number(e.target.value) || 25)} className="w-full rounded-xl px-3 py-2.5 border" style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: theme.text }}>Default break length (minutes)</label>
          <input type="number" min="1" max="60" value={values.breakMinutes} onChange={(e) => onChange('breakMinutes', Number(e.target.value) || 5)} className="w-full rounded-xl px-3 py-2.5 border" style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }} />
        </div>
      </div>
      <div className="mt-2">
        <Toggle checked={values.autoStartNextSession} onChange={() => onChange('autoStartNextSession', !values.autoStartNextSession)} label="Auto-start next session" theme={theme} />
        <Toggle checked={values.soundNotifications} onChange={() => onChange('soundNotifications', !values.soundNotifications)} label="Sound notifications" theme={theme} />
        <Toggle checked={values.desktopNotifications} onChange={() => onChange('desktopNotifications', !values.desktopNotifications)} label="Desktop notifications" theme={theme} />
      </div>
    </section>
  );
};

export default FocusSettings;
