/**
 * Rule-based Focus Coach: generates personalized productivity insights
 * from session data and optional session history. No external AI APIs.
 */

const TIME_LABELS = {
  morning: 'morning (before 12pm)',
  afternoon: 'afternoon (12pm–5pm)',
  evening: 'evening (after 5pm)',
};

function getTimeOfDay(dateStr) {
  const d = new Date(dateStr);
  const h = d.getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getBestTimeOfDayFromHistory(sessions) {
  if (!Array.isArray(sessions) || sessions.length < 5) return null;
  const byPeriod = { morning: [], afternoon: [], evening: [] };
  sessions.forEach((s) => {
    const period = getTimeOfDay(s.date || s.createdAt);
    const score = s.focusScore != null ? s.focusScore : (s.distractions === 0 ? 100 : Math.max(0, 100 - (s.distractions || 0) * 4));
    byPeriod[period].push(score);
  });
  let best = null;
  let bestAvg = -1;
  Object.entries(byPeriod).forEach(([period, scores]) => {
    if (scores.length < 2) return;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      best = period;
    }
  });
  return best ? { period: best, label: TIME_LABELS[best] } : null;
}

/**
 * Generate a single-session coaching message.
 * @param {Object} session - { duration, distractions, focusScore, date (ISO), goalCategory }
 * @param {Array} recentSessions - optional list of past sessions for timing insight
 * @returns {{ message: string }}
 */
export function getInsightForSession(session, recentSessions = []) {
  const duration = session.duration ?? 0;
  const distractions = session.distractions ?? 0;
  const focusScore = session.focusScore != null ? session.focusScore : Math.max(0, 100 - distractions * 4);
  const date = session.date || session.createdAt || new Date().toISOString();
  const currentPeriod = getTimeOfDay(date);

  const messages = [];

  // 1. Frequent distractions → suggest Deep Focus
  if (distractions >= 3) {
    messages.push('You switched tabs multiple times. Consider enabling Deep Focus Mode next time.');
  }

  // 2. Low focus score → suggest shorter sessions
  if (focusScore < 50) {
    messages.push('Your focus score dropped due to multiple distractions. Try shorter focus sessions such as 20 minutes.');
  }

  // 3. High focus, no distractions
  if (focusScore >= 90 && distractions === 0) {
    messages.push('Excellent focus! You stayed distraction-free during this session.');
  }

  // 4. Good but room to improve
  if (focusScore >= 70 && focusScore < 90 && messages.length === 0) {
    messages.push('Good session. Small improvements in reducing distractions could push your score even higher.');
  }

  // 5. Productivity timing (needs history)
  const bestTime = getBestTimeOfDayFromHistory(recentSessions);
  if (bestTime && messages.length < 2) {
    if (currentPeriod === bestTime.period) {
      messages.push(`You tend to focus better in the ${bestTime.label}. Keep scheduling important work then.`);
    } else {
      messages.push(`You tend to focus better in the ${bestTime.label}. Schedule important work around that time.`);
    }
  }

  // 6. Long session + good score
  if (duration >= 45 && focusScore >= 80 && messages.length === 0) {
    messages.push('Strong focus over a long block. You’re building deep work stamina.');
  }

  // 7. Default
  if (messages.length === 0) {
    messages.push('Session complete. Every session builds your focus muscle.');
  }

  return {
    message: messages[0],
    allMessages: messages.slice(0, 2),
  };
}

/**
 * Generate an aggregate insight for the Analytics page from recent sessions.
 * @param {Array} recentSessions - list of sessions (with duration, distractions, focusScore, date)
 * @returns {{ message: string } | null}
 */
export function getAggregateInsight(recentSessions, options = {}) {
  if (!Array.isArray(recentSessions) || recentSessions.length === 0) return null;

  const withScore = recentSessions.map((s) => ({
    ...s,
    focusScore: s.focusScore != null ? s.focusScore : Math.max(0, 100 - (s.distractions || 0) * 4),
  }));

  const avgScore = withScore.reduce((sum, s) => sum + s.focusScore, 0) / withScore.length;
  const totalDistractions = withScore.reduce((sum, s) => sum + (s.distractions || 0), 0);
  const distractionFreeCount = withScore.filter((s) => (s.distractions || 0) === 0).length;
  const bestTime = getBestTimeOfDayFromHistory(withScore);
  const metrics = {
    avgScore: Math.round(avgScore),
    streak: options.currentStreak ?? null,
    sessions: withScore.length,
  };

  if (totalDistractions >= 5 && withScore.length >= 3) {
    return { message: "You've had several sessions with tab switches. Try Deep Focus Mode to minimize distractions.", metrics };
  }

  if (avgScore >= 90 && distractionFreeCount === withScore.length) {
    return { message: 'Your recent sessions have been distraction-free. Keep up the excellent focus habits.', metrics };
  }

  if (avgScore < 60 && withScore.length >= 3) {
    return { message: 'Focus scores have been lower lately. Try shorter blocks (e.g. 20 min) or enabling Deep Focus.', metrics };
  }

  if (bestTime && withScore.length >= 5) {
    return { message: `Based on your history, you tend to focus better in the ${bestTime.label}. Plan important work for that window.`, metrics };
  }

  const last = withScore[withScore.length - 1];
  const result = getInsightForSession(last, withScore.slice(0, -1));
  result.metrics = metrics;
  return result;
}
