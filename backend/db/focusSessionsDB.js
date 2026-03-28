const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.join(__dirname, '../data/focus-sessions.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize empty sessions file if it doesn't exist
if (!fs.existsSync(SESSIONS_FILE)) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: [] }, null, 2));
}

const readSessions = () => {
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
    return JSON.parse(data).sessions || [];
  } catch (err) {
    console.error('[focusDB] Error reading sessions:', err);
    return [];
  }
};

const writeSessions = (sessions) => {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions }, null, 2));
  } catch (err) {
    console.error('[focusDB] Error writing sessions:', err);
  }
};

const focusSessionsDB = {
  // Get all sessions for a user
  getSessionsByUserId: (userId) => {
    const sessions = readSessions();
    return sessions.filter(s => s.userId === userId);
  },

  // Get sessions for a user in the last N days
  getSessionsLastNDays: (userId, days = 7) => {
    const sessions = readSessions();
    const userSessions = sessions.filter(s => s.userId === userId);
    
    const now = new Date();
    const nDaysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return userSessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= nDaysAgo && sessionDate <= now;
    });
  },

  // Create a new session (options: { distractions, completed, focusScore, notes })
  createSession: (userId, duration, goalCategory = 'General', options = {}) => {
    const sessions = readSessions();
    const { distractions = 0, completed = true, focusScore, notes } = options;
    const score = focusScore != null ? focusScore : (completed && distractions === 0 ? 100 : Math.max(0, 100 - distractions * 4));
    const notesList = Array.isArray(notes) ? notes : [];

    const newSession = {
      id: Date.now().toString(),
      userId,
      duration, // in minutes
      goalCategory,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      distractions: Number(distractions) || 0,
      completed: Boolean(completed),
      focusScore: Math.min(100, Math.max(0, score)),
      notes: notesList,
    };

    sessions.push(newSession);
    writeSessions(sessions);
    console.log('[focusDB] Session created:', newSession.id);
    return newSession;
  },

  // Get all sessions (for debugging)
  getAllSessions: () => {
    return readSessions();
  },

  // Clear all sessions (for debugging)
  clearAllSessions: () => {
    writeSessions([]);
  },

  // Get statistics for a user
  getStatistics: (userId) => {
    const sessions = readSessions();
    const userSessions = sessions.filter(s => s.userId === userId);
    
    const totalFocusTime = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const sessionCount = userSessions.length;
    
    // Group by goal category
    const byCategory = {};
    userSessions.forEach(s => {
      const category = s.goalCategory || 'General';
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, totalMinutes: 0 };
      }
      byCategory[category].count++;
      byCategory[category].totalMinutes += s.duration || 0;
    });

    // Get last 7 days breakdown
    const now = new Date();
    const lastSevenDays = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      lastSevenDays[dateStr] = 0;
    }

    userSessions.forEach(s => {
      const dateStr = (s.date || s.createdAt || '').split('T')[0];
      if (dateStr && lastSevenDays.hasOwnProperty(dateStr)) {
        lastSevenDays[dateStr] += s.duration || 0;
      }
    });

    // Last 4 weeks for monthly view (each week = 7 days aggregated)
    const lastFourWeeks = [];
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      let weekMinutes = 0;
      userSessions.forEach(s => {
        const dateStr = (s.date || s.createdAt || '').split('T')[0];
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (d >= weekStart && d <= weekEnd) {
          weekMinutes += s.duration || 0;
        }
      });
      const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      lastFourWeeks.push({
        week: `W${4 - w}`,
        day: `${startStr}–${endStr}`,
        minutes: weekMinutes,
      });
    }

    return {
      totalSessions: sessionCount,
      totalFocusTime,
      averageSessionDuration: sessionCount > 0 ? Math.round(totalFocusTime / sessionCount) : 0,
      byCategory,
      lastSevenDays,
      lastFourWeeks,
    };
  },

  // Sessions completed today (by user)
  getSessionsToday: (userId) => {
    const sessions = readSessions();
    const userSessions = sessions.filter(s => s.userId === userId);
    const today = new Date().toISOString().split('T')[0];
    return userSessions.filter(s => (s.date || s.createdAt || '').split('T')[0] === today);
  },

  // Total focus time today in minutes
  getFocusTimeToday: (userId) => {
    const todaySessions = focusSessionsDB.getSessionsToday(userId);
    return todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  },

  // Current streak: consecutive days with at least one focus session (counting today)
  getCurrentStreak: (userId) => {
    const sessions = readSessions();
    const userSessions = sessions.filter(s => s.userId === userId);
    if (userSessions.length === 0) return 0;

    const uniqueDays = new Set();
    userSessions.forEach(s => {
      const dateStr = (s.date || s.createdAt || '').split('T')[0];
      if (dateStr) uniqueDays.add(dateStr);
    });

    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let check = today;

    while (uniqueDays.has(check)) {
      streak++;
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = d.toISOString().split('T')[0];
    }

    return streak;
  },

  // Longest streak: max consecutive days with at least one focus session
  getLongestStreak: (userId) => {
    const sessions = readSessions();
    const userSessions = sessions.filter(s => s.userId === userId);
    if (userSessions.length === 0) return 0;

    const uniqueDays = new Set();
    userSessions.forEach(s => {
      const dateStr = (s.date || s.createdAt || '').split('T')[0];
      if (dateStr) uniqueDays.add(dateStr);
    });
    const sortedDays = Array.from(uniqueDays).sort();

    let longest = 1;
    let current = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diffDays = Math.round((curr - prev) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }
    return longest;
  },

  // Unique session dates for streak calendar (e.g. last 12 weeks)
  getSessionDatesForCalendar: (userId, pastDays = 84) => {
    const sessions = readSessions();
    const userSessions = sessions.filter(s => s.userId === userId);
    const set = new Set();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - pastDays);
    userSessions.forEach(s => {
      const dateStr = (s.date || s.createdAt || '').split('T')[0];
      if (dateStr && new Date(dateStr) >= cutoff) set.add(dateStr);
    });
    return Array.from(set);
  },

  // Heatmap: aggregated daily focus minutes and session count for last N days
  getHeatmapData: (userId, pastDays = 84) => {
    const sessions = readSessions();
    const userSessions = sessions.filter(s => s.userId === userId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - pastDays);
    cutoff.setHours(0, 0, 0, 0);

    const byDate = {};
    userSessions.forEach(s => {
      const dateStr = (s.date || s.createdAt || '').split('T')[0];
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d < cutoff) return;
      if (!byDate[dateStr]) byDate[dateStr] = { minutes: 0, sessions: 0 };
      byDate[dateStr].minutes += s.duration || 0;
      byDate[dateStr].sessions += 1;
    });

    const result = [];
    for (let i = 0; i < pastDays; i++) {
      const d = new Date(cutoff);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const agg = byDate[dateStr] || { minutes: 0, sessions: 0 };
      result.push({
        date: dateStr,
        minutes: agg.minutes,
        sessions: agg.sessions,
      });
    }
    return result;
  },
};

module.exports = focusSessionsDB;
