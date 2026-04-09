import React from 'react';

const NotificationSettings = ({ theme, values, onChange }) => {
  const items = [
    ['emailNotifications', 'Email notifications'],
    ['sessionCompletionAlerts', 'Session completion alerts'],
    ['breakReminders', 'Break reminders'],
    ['weeklyProductivitySummary', 'Weekly productivity summary'],
  ];

  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}>
      <h2 className="text-xl font-semibold mb-1" style={{ color: theme.primary }}>Notifications</h2>
      <p className="text-sm mb-5" style={{ color: theme.text, opacity: 0.8 }}>
        Choose which notifications you want to receive.
      </p>
      <div className="space-y-2">
        {items.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between py-2.5">
            <span className="text-sm font-medium" style={{ color: theme.text }}>{label}</span>
            <input
              type="checkbox"
              checked={Boolean(values[key])}
              onChange={(e) => onChange(key, e.target.checked)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>
    </section>
  );
};

export default NotificationSettings;
