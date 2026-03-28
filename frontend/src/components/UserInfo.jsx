import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { themeConfig, goals } from '../utils/themeConfig';

const UserInfo = ({
  userName = 'User',
  userGoal = 'default',
  stats = { sessionsToday: 0, focusTimeToday: 0, tasksCompleted: 0, currentStreak: 0 },
  loading = false,
}) => {
  const { currentTheme } = useTheme();
  const goalConfig = themeConfig[userGoal];
  const goalName = goalConfig?.name || 'Default';
  const goalEmoji = goals.find(g => g.key === userGoal)?.emoji || '⭐';

  return (
    <div
      className="rounded-2xl p-6 shadow-sm transition-all duration-300"
      style={{
        backgroundColor: currentTheme.background,
        border: `2px solid ${currentTheme.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-white text-2xl transition-all duration-300"
            style={{
              backgroundColor: currentTheme.primary,
            }}
          >
            {goalEmoji}
          </div>
          <div>
            <h1 className="text-2xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
              Welcome, {userName}! 👋
            </h1>
            <p className="text-sm mt-1 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
              Your focus goal: <span className="font-semibold">{goalName}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div
          className="rounded-lg p-3 text-center transition-all duration-300"
          style={{
            backgroundColor: currentTheme.accent,
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          <p className="text-2xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
            {loading ? '…' : stats.sessionsToday}
          </p>
          <p className="text-xs mt-1 transition-colors duration-300" style={{ color: currentTheme.text }}>
            Sessions Today
          </p>
        </div>
        <div
          className="rounded-lg p-3 text-center transition-all duration-300"
          style={{
            backgroundColor: currentTheme.accent,
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          <p className="text-2xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
            {loading ? '…' : `${stats.focusTimeToday}m`}
          </p>
          <p className="text-xs mt-1 transition-colors duration-300" style={{ color: currentTheme.text }}>
            Focused Time
          </p>
        </div>
        <div
          className="rounded-lg p-3 text-center transition-all duration-300"
          style={{
            backgroundColor: currentTheme.accent,
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          <p className="text-2xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
            {loading ? '…' : (stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : '0')}
          </p>
          <p className="text-xs mt-1 transition-colors duration-300" style={{ color: currentTheme.text }}>
            Day Streak
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
