import React from 'react';

const DAYS_TO_SHOW = 84; // 12 weeks
const COLS = 21;

const StreakCalendar = ({ sessionDates = [], theme }) => {
  const dateSet = new Set(sessionDates || []);
  const today = new Date().toISOString().split('T')[0];
  const cells = [];
  const start = new Date();
  start.setDate(start.getDate() - (DAYS_TO_SHOW - 1));

  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const hasSession = dateSet.has(dateStr);
    const isToday = dateStr === today;
    cells.push({ dateStr, hasSession, isToday });
  }

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}>
      <p className="text-xs mb-2 flex items-center gap-2" style={{ color: theme.text, opacity: 0.9 }}>
        <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: theme.border }} />
        <span>No session</span>
        <span className="inline-block w-3 h-3 rounded-sm ml-2" style={{ backgroundColor: theme.primary }} />
        <span>Session completed</span>
      </p>
      <div
        className="grid gap-0.5 font-mono text-[10px]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        }}
      >
        {cells.map(({ dateStr, hasSession, isToday }) => (
          <div
            key={dateStr}
            title={dateStr}
            className="w-full aspect-square rounded-sm flex items-center justify-center"
            style={{
              backgroundColor: hasSession ? theme.primary : theme.border,
              opacity: hasSession ? (isToday ? 1 : 0.85) : 0.35,
              border: isToday ? `2px solid ${theme.text}` : 'none',
            }}
          />
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: theme.text, opacity: 0.7 }}>
        Last 12 weeks · Each square = one day; filled = focus session completed
      </p>
    </div>
  );
};

export default StreakCalendar;
