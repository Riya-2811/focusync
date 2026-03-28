import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import UserInfo from '../components/UserInfo';
import GoalsSelector from '../components/GoalsSelector';
import ThemeColorPicker from '../components/ThemeColorPicker';
import StreakCalendar from '../components/StreakCalendar';
import ProductivityHeatmap from '../components/ProductivityHeatmap';
import CurrentAffairs from '../components/CurrentAffairs';
import FeatureCards from '../components/FeatureCards';
import { themeConfig } from '../utils/themeConfig';
import axios from 'axios';
import { API_BASE } from '../utils/api';

const Dashboard = () => {
  const { currentTheme, selectedGoal, completeOnboarding } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userName] = useState(() => {
    const saved = localStorage.getItem('username');
    return saved || 'User';
  });
  const [stats, setStats] = useState({
    sessionsToday: 0,
    focusTimeToday: 0,
    tasksCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    focusLevel: 1,
    sessionDatesForCalendar: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE}/focus/dashboard`, { headers: { Authorization: token } })
      .then((res) => setStats(res.data))
      .catch(() => setStats({
        sessionsToday: 0,
        focusTimeToday: 0,
        tasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        focusLevel: 1,
        sessionDatesForCalendar: [],
      }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleGoalChange = (goal) => {
    completeOnboarding(goal);
  };

  return (
    <div
      className="min-h-screen p-8 transition-all duration-300"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <UserInfo userName={userName} userGoal={selectedGoal} stats={stats} loading={loading} />

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
              Select Focus Goal
            </h2>
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setShowThemePicker(true)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: `${currentTheme.primary}20`,
                  color: currentTheme.primary,
                  border: `2px solid ${currentTheme.primary}`,
                }}
                title="Customize theme color"
              >
                🎨 Customize theme
              </button>
            )}
          </div>
          <GoalsSelector selectedGoal={selectedGoal} onSelectGoal={handleGoalChange} />
        </div>
        <ThemeColorPicker isOpen={showThemePicker} onClose={() => setShowThemePicker(false)} />

        {/* Gamification: Streak, Points, Level */}
        <div
          className="rounded-2xl p-6 shadow-md transition-all duration-300"
          style={{
            backgroundColor: currentTheme.background,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: currentTheme.primary }}>
            🏆 Progress & Streaks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: '#f9731620', color: '#ea580c' }}
              >
                🔥
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  {loading ? '…' : (stats.currentStreak ?? 0)}
                </p>
                <p className="text-xs font-medium" style={{ color: currentTheme.text, opacity: 0.7 }}>
                  DAY STREAK
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: '#f59e0b20', color: '#d97706' }}
              >
                ⚡
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  {loading ? '…' : (stats.totalPoints ?? 0).toLocaleString()}
                </p>
                <p className="text-xs font-medium" style={{ color: currentTheme.text, opacity: 0.7 }}>
                  TOTAL POINTS
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${currentTheme.primary}30`, color: currentTheme.primary }}
              >
                🏅
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  {loading ? '…' : (stats.focusLevel ?? 1)}
                </p>
                <p className="text-xs font-medium" style={{ color: currentTheme.text, opacity: 0.7 }}>
                  FOCUS LEVEL
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: currentTheme.text, opacity: 0.7 }}>
            Earn points from focus sessions and completed tasks. Level up as you build momentum!
          </p>
        </div>

        <div
          className="rounded-2xl p-6 shadow-sm transition-all duration-300"
          style={{
            backgroundColor: currentTheme.background,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: currentTheme.primary }}>
            📈 Today's Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg transition-all duration-300" style={{ backgroundColor: currentTheme.accent }}>
              <p className="text-3xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
                {loading ? '…' : `${stats.focusTimeToday}m`}
              </p>
              <p className="text-sm mt-2 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
                Focus Time
              </p>
            </div>
            <div className="text-center p-3 rounded-lg transition-all duration-300" style={{ backgroundColor: currentTheme.accent }}>
              <p className="text-3xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
                {loading ? '…' : stats.sessionsToday}
              </p>
              <p className="text-sm mt-2 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
                Sessions Completed
              </p>
            </div>
            <div className="text-center p-3 rounded-lg transition-all duration-300" style={{ backgroundColor: currentTheme.accent }}>
              <p className="text-3xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
                {loading ? '…' : stats.tasksCompleted}
              </p>
              <p className="text-sm mt-2 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
                Tasks Done
              </p>
            </div>
            <div className="text-center p-3 rounded-lg transition-all duration-300" style={{ backgroundColor: currentTheme.accent }}>
              <p className="text-3xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
                {loading ? '…' : (stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : '0')}
              </p>
              <p className="text-sm mt-2 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
                Day Streak
              </p>
            </div>
            <div className="text-center p-3 rounded-lg transition-all duration-300" style={{ backgroundColor: currentTheme.accent }}>
              <p className="text-3xl font-bold transition-colors duration-300" style={{ color: currentTheme.primary }}>
                {loading ? '…' : (stats.longestStreak ?? 0)}
              </p>
              <p className="text-sm mt-2 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
                Longest Streak
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 shadow-sm transition-all duration-300"
          style={{
            backgroundColor: currentTheme.background,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: currentTheme.primary }}>
            📅 Streak Calendar
          </h2>
          <p className="text-sm mb-4 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
            Days you completed at least one focus session. Streak resets if you miss a day.
          </p>
          <StreakCalendar sessionDates={stats.sessionDatesForCalendar} theme={currentTheme} />
        </div>

        {isLoggedIn && (
          <div
            className="rounded-2xl p-6 shadow-sm transition-all duration-300"
            style={{
              backgroundColor: currentTheme.background,
              border: `2px solid ${currentTheme.border}`,
            }}
          >
            <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: currentTheme.primary }}>
              📊 Productivity Heatmap
            </h2>
            <p className="text-sm mb-4 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
              Focus activity over the last 12 weeks. Hover over a day for details.
            </p>
            <ProductivityHeatmap theme={currentTheme} token={localStorage.getItem('token')} />
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: currentTheme.primary }}>
            📰 Current Affairs ({themeConfig[selectedGoal]?.name})
          </h2>
          <p className="text-sm mb-4 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
            Stay updated with news and articles related to your focus area. Let us know what interests you!
          </p>
          <CurrentAffairs goal={selectedGoal} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: currentTheme.primary }}>
            Quick Access
          </h2>
          <FeatureCards />
        </div>

        <div
          className="rounded-2xl p-6 shadow-sm text-center transition-all duration-300"
          style={{
            backgroundColor: currentTheme.accent,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          <h3 className="text-lg font-bold mb-2 transition-colors duration-300" style={{ color: currentTheme.primary }}>
            {stats.currentStreak > 0 ? "💪 You're Doing Great!" : '🌟 Get Started'}
          </h3>
          <p className="transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
            {stats.currentStreak > 0
              ? `You've maintained a ${stats.currentStreak}-day streak. Keep up the focus and productivity will follow naturally.`
              : 'Start a focus session or add a task to begin building your streak and see your progress here.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
