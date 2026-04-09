const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const focusSessionsDB = require('../db/focusSessionsDB');
const tasksDB = require('../db/tasksDB');
const updatesDB = require('../db/updatesDB');

// Get all focus sessions for the current user
router.get('/', auth, (req, res) => {
  try {
    console.log('[FOCUS] Fetching sessions for user:', req.userId);
    const sessions = focusSessionsDB.getSessionsByUserId(req.userId);
    res.json(sessions);
  } catch (err) {
    console.error('[FOCUS] Error fetching sessions:', err);
    res.status(400).json({ error: err.message });
  }
});

// Points: 10 base + floor(duration/5) per session, 5 per completed task
function computeTotalPoints(sessions, completedTasks) {
  let pts = 0;
  sessions.forEach((s) => {
    pts += 10 + Math.floor((s.duration || 0) / 5);
  });
  pts += completedTasks * 5;
  return pts;
}

// Level from total points (roughly 250–350 pts per level, 3420 → level 12)
function pointsToLevel(points) {
  if (points < 100) return 1;
  if (points < 250) return 2;
  if (points < 500) return 3;
  if (points < 750) return 4;
  if (points < 1000) return 5;
  if (points < 1500) return 6;
  if (points < 2000) return 7;
  if (points < 2500) return 8;
  if (points < 3000) return 9;
  if (points < 3500) return 10;
  if (points < 4200) return 11;
  if (points < 5000) return 12;
  return Math.min(99, 13 + Math.floor((points - 5000) / 500));
}

// Dashboard summary: today's stats + streak + gamification (points, level)
router.get('/dashboard', auth, (req, res) => {
  try {
    const userId = req.userId;
    const sessions = focusSessionsDB.getSessionsByUserId(userId);
    const sessionsToday = focusSessionsDB.getSessionsToday(userId);
    const focusTimeToday = focusSessionsDB.getFocusTimeToday(userId);
    const currentStreak = focusSessionsDB.getCurrentStreak(userId);
    const longestStreak = focusSessionsDB.getLongestStreak(userId);
    const sessionDatesForCalendar = focusSessionsDB.getSessionDatesForCalendar(userId, 84);
    const tasks = tasksDB.getTasksByUserId(userId);
    const tasksCompleted = tasks.filter(t => t.completed).length;
    const totalPoints = computeTotalPoints(sessions, tasksCompleted);
    const focusLevel = pointsToLevel(totalPoints);

    res.json({
      sessionsToday: sessionsToday.length,
      focusTimeToday,
      tasksCompleted,
      currentStreak,
      longestStreak,
      totalPoints,
      focusLevel,
      sessionDatesForCalendar,
    });
  } catch (err) {
    console.error('[FOCUS] Dashboard error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Heatmap: daily aggregated focus data for last 12 weeks
router.get('/heatmap', auth, (req, res) => {
  try {
    const data = focusSessionsDB.getHeatmapData(req.userId, 84);
    res.json({ data });
  } catch (err) {
    console.error('[FOCUS] Heatmap error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get analytics/statistics for the current user
router.get('/analytics/summary', auth, (req, res) => {
  try {
    console.log('[FOCUS] Fetching analytics for user:', req.userId);
    
    // Get focus statistics
    const focusStats = focusSessionsDB.getStatistics(req.userId);
    
    // Get task statistics
    const tasks = tasksDB.getTasksByUserId(req.userId);
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    
    // Group tasks by priority
    const tasksByPriority = {
      High: 0,
      Medium: 0,
      Low: 0,
    };
    
    tasks.forEach(t => {
      tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
    });
    
    // Build weekly focus chart data
    const weeklyData = [];
    const lastSevenDays = focusStats.lastSevenDays || {};
    Object.entries(lastSevenDays).forEach(([date, minutes]) => {
      const d = new Date(date);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      weeklyData.push({
        date,
        day: dayName,
        minutes,
      });
    });

    // Build monthly focus chart data (last 4 weeks)
    const monthlyData = focusStats.lastFourWeeks || [];

    // Build goal distribution data (from tasks)
    const goalDistribution = {};
    tasks.forEach(t => {
      // Extract goal from task - we'll use priority as proxy for now
      const goal = t.goalCategory || 'General';
      goalDistribution[goal] = (goalDistribution[goal] || 0) + 1;
    });

    const allSessions = focusSessionsDB.getSessionsByUserId(req.userId);
    const recentSessions = allSessions
      .slice(-20)
      .reverse()
      .map((s) => ({
        id: s.id,
        duration: s.duration,
        goalCategory: s.goalCategory,
        distractions: s.distractions ?? 0,
        completed: s.completed !== false,
        focusScore: s.focusScore != null ? s.focusScore : null,
        date: s.date || s.createdAt,
        notes: s.notes || [],
      }));

    const currentStreak = focusSessionsDB.getCurrentStreak(req.userId);

    res.json({
      overview: {
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        focusSessions: focusStats.totalSessions,
        totalFocusTime: focusStats.totalFocusTime,
        averageSessionDuration: focusStats.averageSessionDuration,
        currentStreak,
      },
      weeklyFocusChart: weeklyData,
      monthlyFocusChart: monthlyData,
      taskCompletion: {
        completed: completedTasks,
        pending: pendingTasks,
      },
      goalDistribution,
      tasksByPriority,
      focusStats: focusStats.byCategory,
      recentSessions,
    });
  } catch (err) {
    console.error('[FOCUS] Error fetching analytics:', err);
    res.status(400).json({ error: err.message });
  }
});

// Create a focus session (body: duration, goalCategory, distractions?, completed?, focusScore?, notes?)
router.post('/', auth, (req, res) => {
  try {
    const { duration, goalCategory, distractions, completed, focusScore, notes } = req.body;

    if (!duration) {
      return res.status(400).json({ error: 'Duration is required' });
    }

    console.log('[FOCUS] Creating session for user:', req.userId);
    const session = focusSessionsDB.createSession(req.userId, duration, goalCategory, {
      distractions,
      completed,
      focusScore,
      notes: Array.isArray(notes) ? notes : [],
    });

    res.status(201).json(session);
  } catch (err) {
    console.error('[FOCUS] Error creating session:', err);
    res.status(400).json({ error: err.message });
  }
});

// Clear user productivity history (focus sessions + tasks + update preferences)
router.delete('/history', auth, (req, res) => {
  try {
    focusSessionsDB.clearSessionsByUserId(req.userId);
    tasksDB.clearTasksByUserId(req.userId);
    updatesDB.clearByUserId(req.userId);
    res.json({ message: 'Productivity history cleared' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
