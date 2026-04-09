import React from 'react';

const ToggleRow = ({ theme, label, checked, onToggle }) => (
  <label className="flex items-center justify-between py-2.5">
    <span className="text-sm font-medium" style={{ color: theme.text }}>{label}</span>
    <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4" />
  </label>
);

const ProductivitySettings = ({ theme, values, onChange }) => {
  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}>
      <h2 className="text-xl font-semibold mb-1" style={{ color: theme.primary }}>Productivity Preferences</h2>
      <p className="text-sm mb-5" style={{ color: theme.text, opacity: 0.8 }}>
        Personalize goals, reports, and reminder behavior.
      </p>
      <div className="mb-3">
        <label className="text-sm font-medium block mb-1.5" style={{ color: theme.text }}>Daily focus goal (hours)</label>
        <input
          type="number"
          min="1"
          max="16"
          step="0.5"
          value={values.dailyFocusGoalHours}
          onChange={(e) => onChange('dailyFocusGoalHours', Number(e.target.value) || 2)}
          className="w-full rounded-xl px-3 py-2.5 border"
          style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
        />
      </div>
      <ToggleRow theme={theme} label="Enable weekly reports" checked={values.weeklyReports} onToggle={() => onChange('weeklyReports', !values.weeklyReports)} />
      <ToggleRow theme={theme} label="Enable productivity reminders" checked={values.productivityReminders} onToggle={() => onChange('productivityReminders', !values.productivityReminders)} />
      <ToggleRow theme={theme} label="Enable distraction alerts" checked={values.distractionAlerts} onToggle={() => onChange('distractionAlerts', !values.distractionAlerts)} />
    </section>
  );
};

export default ProductivitySettings;
