import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getAggregateInsight } from '../utils/focusCoach';
import ProductivityHeatmap from '../components/ProductivityHeatmap';

const StatCard = ({ label, value, icon, subtext, theme }) => (
  <div
    className="rounded-xl p-4 shadow-md"
    style={{
      backgroundColor: theme.background,
      border: `2px solid ${theme.border}`,
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-3xl">{icon}</span>
      <span className="text-lg font-bold" style={{ color: theme.primary }}>
        {value}
      </span>
    </div>
    <p className="text-sm font-semibold" style={{ color: theme.text, opacity: 0.9 }}>
      {label}
    </p>
    {subtext && (
      <p className="text-xs mt-1" style={{ color: theme.text, opacity: 0.85 }}>
        {subtext}
      </p>
    )}
  </div>
);

const ChartCard = ({ title, children, theme }) => (
  <div
    className="rounded-xl p-6 shadow-md"
    style={{
      backgroundColor: theme.background,
      border: `2px solid ${theme.border}`,
    }}
  >
    <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
      📊 {title}
    </h3>
    {children}
  </div>
);

const Analytics = () => {
  const { currentTheme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focusChartView, setFocusChartView] = useState('week');
  const [insightDismissed, setInsightDismissed] = useState(false);
  const token = localStorage.getItem('token');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/focus/analytics/summary`, {
        headers: { Authorization: token },
      });
      setData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.accent} 100%)`,
        }}
      >
        <div style={{ color: currentTheme.text, opacity: 0.9 }}>Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="min-h-screen p-8"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.accent} 100%)`,
        }}
      >
        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: currentTheme.background,
            border: `2px dashed ${currentTheme.border}`,
            color: currentTheme.text,
          }}
        >
          <p className="text-lg mb-2">📊 No data available yet</p>
          <p className="text-sm opacity-70">Start using the Focus Timer and creating tasks to see analytics!</p>
        </div>
      </div>
    );
  }

  const { overview, weeklyFocusChart, monthlyFocusChart, taskCompletion, goalDistribution, tasksByPriority, recentSessions = [] } = data;

  // Prepare chart data
  const weeklyData = weeklyFocusChart || [];
  const monthlyData = monthlyFocusChart || [];
  const focusChartData = focusChartView === 'month' ? monthlyData : weeklyData;
  const taskCompletionData = [
    { name: 'Completed', value: taskCompletion?.completed || 0 },
    { name: 'Pending', value: taskCompletion?.pending || 0 },
  ];

  const goalData = Object.entries(goalDistribution || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const sessionsWithScore = (recentSessions || []).filter((s) => s.focusScore != null);
  const avgFocusScore =
    sessionsWithScore.length > 0
      ? Math.round(
          sessionsWithScore.reduce((a, s) => a + s.focusScore, 0) / sessionsWithScore.length
        )
      : null;

  // Colors for charts
  const COLORS = [
    currentTheme.primary,
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
  ];

  const chartColors = {
    pending: '#ef4444',
    completed: '#10b981',
  };

  const userName = localStorage.getItem('username') || '';
  const currentStreak = overview?.currentStreak ?? null;
  const coachInsight = getAggregateInsight(recentSessions, { currentStreak });

  return (
    <div
      className="min-h-screen p-8 transition-all duration-300 ease-out"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.accent} 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: currentTheme.primary }}>
            📊 Analytics Dashboard
          </h1>
          <p style={{ color: currentTheme.text, opacity: 0.9 }}>
            Track your productivity and focus patterns
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total Tasks"
            value={overview?.totalTasks || 0}
            icon="📌"
            theme={currentTheme}
          />
          <StatCard
            label="Completed"
            value={overview?.completedTasks || 0}
            icon="✅"
            theme={currentTheme}
          />
          <StatCard
            label="Focus Sessions"
            value={overview?.focusSessions || 0}
            icon="⏱️"
            theme={currentTheme}
          />
          <StatCard
            label="Focus Time"
            value={`${overview?.totalFocusTime || 0}m`}
            icon="🎯"
            theme={currentTheme}
          />
          <StatCard
            label="Avg Duration"
            value={`${overview?.averageSessionDuration || 0}m`}
            icon="⏰"
            theme={currentTheme}
          />
          {avgFocusScore != null && (
            <StatCard
              label="Avg Focus Score"
              value={`${avgFocusScore}%`}
              icon="🎯"
              subtext="From recent sessions"
              theme={currentTheme}
            />
          )}
        </div>

        {/* Focus Coach Insight */}
        {coachInsight?.message && !insightDismissed && (
          <div
            className="rounded-2xl p-6 shadow-lg mb-8 overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}18 0%, ${currentTheme.primary}0a 100%)`,
              border: `2px solid ${currentTheme.primary}30`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${currentTheme.primary}30` }}
              >
                ✨
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1" style={{ color: currentTheme.primary }}>
                  Focus Coach Insight
                </h3>
                {((coachInsight.metrics?.avgScore ?? avgFocusScore) != null || (coachInsight.metrics?.streak ?? currentStreak) != null) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(coachInsight.metrics?.avgScore ?? avgFocusScore) != null && (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: `${currentTheme.primary}25`,
                          color: currentTheme.primary,
                        }}
                      >
                        {(coachInsight.metrics?.avgScore ?? avgFocusScore)}/100 focus
                      </span>
                    )}
                    {(coachInsight.metrics?.streak ?? currentStreak) != null && (coachInsight.metrics?.streak ?? currentStreak) > 0 && (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: `${currentTheme.primary}25`,
                          color: currentTheme.primary,
                        }}
                      >
                        🔥 {(coachInsight.metrics?.streak ?? currentStreak)}-day streak
                      </span>
                    )}
                    {(coachInsight.metrics?.sessions ?? overview?.focusSessions) != null && (coachInsight.metrics?.sessions ?? overview?.focusSessions) > 0 && (
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: currentTheme.accent,
                          color: currentTheme.text,
                          opacity: 0.9,
                        }}
                      >
                        {(coachInsight.metrics?.sessions ?? overview?.focusSessions)} sessions
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm leading-relaxed" style={{ color: currentTheme.text, opacity: 0.95 }}>
                  {userName ? `${userName}, ${coachInsight.message.charAt(0).toLowerCase()}${coachInsight.message.slice(1)}` : coachInsight.message}
                </p>
                <button
                  type="button"
                  onClick={() => setInsightDismissed(true)}
                  className="mt-4 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                  style={{
                    backgroundColor: currentTheme.text,
                    color: currentTheme.background,
                  }}
                >
                  Awesome, got it!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Productivity Heatmap */}
        <ChartCard title="Productivity Heatmap" theme={currentTheme}>
          <p className="text-sm mb-4" style={{ color: currentTheme.text, opacity: 0.9 }}>
            Focus activity by day for the last 12 weeks. Hover for focus minutes and sessions.
          </p>
          <ProductivityHeatmap theme={currentTheme} token={token} />
        </ChartCard>

        {/* Session Results (Focus Score) */}
        {recentSessions.length > 0 && (
          <ChartCard title="Session Results" theme={currentTheme}>
            <p className="text-sm mb-4" style={{ color: currentTheme.text, opacity: 0.9 }}>
              Recent focus sessions with duration, distractions, focus score, and quick-capture notes.
            </p>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentSessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl p-4 flex flex-col gap-2"
                  style={{
                    backgroundColor: currentTheme.accent,
                    border: `1px solid ${currentTheme.border}`,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-4 items-center">
                      <span className="font-semibold" style={{ color: currentTheme.primary }}>
                        Duration: {session.duration} min
                      </span>
                      <span style={{ color: currentTheme.text, opacity: 0.9 }}>
                        Distractions: {session.distractions ?? 0}
                      </span>
                      {session.focusScore != null && (
                        <span className="font-semibold" style={{ color: currentTheme.primary }}>
                          Focus Score: {session.focusScore}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: currentTheme.text, opacity: 0.8 }}>
                      {session.date ? new Date(session.date).toLocaleDateString(undefined, { dateStyle: 'short' }) : ''}
                    </div>
                  </div>
                  {session.notes && session.notes.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: currentTheme.border, color: currentTheme.text, opacity: 0.9 }}>
                      <span className="font-medium" style={{ color: currentTheme.primary }}>Notes: </span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {session.notes.map((n, i) => (
                          <li key={i}>{typeof n === 'object' && n.text != null ? n.text : String(n)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly/Monthly Focus Chart */}
          <ChartCard title="Focus Time" theme={currentTheme}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div
                className="inline-flex rounded-lg p-1"
                style={{ backgroundColor: currentTheme.accent, border: `1px solid ${currentTheme.border}` }}
              >
                <button
                  type="button"
                  onClick={() => setFocusChartView('week')}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: focusChartView === 'week' ? currentTheme.background : 'transparent',
                    color: focusChartView === 'week' ? currentTheme.primary : currentTheme.text,
                    opacity: focusChartView === 'week' ? 1 : 0.7,
                  }}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setFocusChartView('month')}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: focusChartView === 'month' ? currentTheme.background : 'transparent',
                    color: focusChartView === 'month' ? currentTheme.primary : currentTheme.text,
                    opacity: focusChartView === 'month' ? 1 : 0.7,
                  }}
                >
                  Monthly
                </button>
              </div>
            </div>
            {focusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={focusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.border} />
                  <XAxis dataKey="day" stroke={currentTheme.text} />
                  <YAxis stroke={currentTheme.text} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: currentTheme.background,
                      border: `2px solid ${currentTheme.primary}`,
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: currentTheme.text }}
                  />
                  <Bar dataKey="minutes" fill={currentTheme.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{ color: currentTheme.text, opacity: 0.9 }}
                className="h-[300px] flex items-center justify-center"
              >
                No focus data yet
              </div>
            )}
          </ChartCard>

          {/* Task Completion Chart */}
          <ChartCard title="Task Completion Status" theme={currentTheme}>
            {taskCompletionData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskCompletionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? chartColors.completed : chartColors.pending}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: currentTheme.background,
                      border: `2px solid ${currentTheme.primary}`,
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: currentTheme.text }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{ color: currentTheme.text, opacity: 0.9 }}
                className="h-[300px] flex items-center justify-center"
              >
                No tasks yet
              </div>
            )}
          </ChartCard>
        </div>

        {/* Goal Distribution Chart */}
        <ChartCard title="Task Distribution by Goal" theme={currentTheme}>
          {goalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={goalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {goalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: currentTheme.background,
                    border: `2px solid ${currentTheme.primary}`,
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: currentTheme.text }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{ color: currentTheme.text, opacity: 0.9 }}
              className="h-[300px] flex items-center justify-center"
            >
              No goal data available
            </div>
          )}
        </ChartCard>

        {/* Task Priority Breakdown */}
        {tasksByPriority && (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {Object.entries(tasksByPriority).map(([priority, count]) => {
              const priorityColors = {
                High: '#ef4444',
                Medium: '#f59e0b',
                Low: '#10b981',
              };
              return (
                <div
                  key={priority}
                  className="rounded-xl p-4 text-center shadow-md"
                  style={{
                    backgroundColor: currentTheme.background,
                    border: `2px solid ${currentTheme.border}`,
                  }}
                >
                  <div
                    className="text-2xl font-bold mb-2"
                    style={{ color: priorityColors[priority] }}
                  >
                    {count}
                  </div>
                  <div style={{ color: currentTheme.text, fontSize: '0.875rem' }}>
                    {priority} Priority
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Insights Section */}
        <div
          className="rounded-xl p-6 mt-8 shadow-md"
          style={{
            backgroundColor: currentTheme.background,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: currentTheme.primary }}>
            💡 Insights
          </h3>
          <div className="space-y-2" style={{ color: currentTheme.text, opacity: 0.9 }}>
            {overview?.focusSessions > 0 && (
              <p>
                ✨ You've completed <strong>{overview?.focusSessions}</strong> focus sessions!
              </p>
            )}
            {overview?.totalFocusTime > 0 && (
              <p>
                🎯 Total focus time: <strong>{overview?.totalFocusTime}</strong> minutes
              </p>
            )}
            {overview?.completedTasks > 0 && overview?.totalTasks > 0 && (
              <p>
                🚀 Completion rate:{' '}
                <strong>
                  {Math.round((overview?.completedTasks / overview?.totalTasks) * 100)}%
                </strong>
              </p>
            )}
            {overview?.averageSessionDuration > 0 && (
              <p>
                ⏰ Average session length: <strong>{overview?.averageSessionDuration}</strong> minutes
              </p>
            )}
            {overview?.focusSessions === 0 && overview?.totalTasks === 0 && (
              <p>Start creating tasks and using the Focus Timer to see your analytics here!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
