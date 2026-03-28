/**
 * Browser notification helpers for the Focus Timer.
 * Uses the Notification API; works when tab is hidden (visibility-aware).
 */

export const NOTIFICATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Coach-style body message based on remaining time and chosen technique.
 * @param {number} minutesLeft - remaining focus minutes
 * @param {{ totalDurationMinutes: number, techniqueName: string }} [technique] - optional; adapts phrasing and thresholds to session length
 */
export function getPeriodicNotificationBody(minutesLeft, technique) {
  const mins = Math.max(0, Math.ceil(minutesLeft));
  const total = technique?.totalDurationMinutes;
  const name = technique?.techniqueName || '';

  const isLongSession = total != null && total >= 45;
  const isShortSession = total != null && total <= 20;
  const halfway = total != null ? total / 2 : 10;
  const finalStretch = total != null ? Math.min(5, Math.max(1, Math.floor(total * 0.2))) : 5;

  let line1;
  if (mins >= (total != null ? Math.ceil(total * 0.6) : 20)) {
    line1 = isLongSession ? 'Deep focus in progress.' : isShortSession ? 'Short focus block in progress.' : 'Focus session running.';
  } else if (mins > finalStretch && total != null && mins <= halfway + 2) {
    line1 = "Keep going, you're halfway there.";
  } else if (mins > finalStretch) {
    line1 = mins >= 10 ? "Keep going, you're halfway there." : 'Focus session running.';
  } else if (mins >= 1) {
    line1 = 'Final stretch.';
  } else {
    line1 = 'Almost there!';
  }

  const line2 = mins >= 1 ? `${mins} minute${mins === 1 ? '' : 's'} remaining` : 'Less than a minute left';
  const sessionHint = name ? `\n${name}` : '';
  return `${line1}\n${line2}${sessionHint}`;
}

/**
 * Completion body adapted to technique (e.g. "25 min Pomodoro complete").
 */
export function getCompletionBody(technique) {
  if (!technique?.techniqueName && technique?.totalDurationMinutes == null) {
    return 'Great job! Time to take a break.';
  }
  const part = technique.totalDurationMinutes != null
    ? `${technique.totalDurationMinutes} min ${technique.techniqueName || 'focus'} complete. `
    : '';
  return `${part}Great job! Time to take a break.`;
}

/** Optional app icon for notifications */
export function getNotificationIcon() {
  try {
    const base = window.location.origin;
    return `${base}${(process.env.PUBLIC_URL || '').replace(/\/$/, '')}/logo.jpeg`;
  } catch {
    return undefined;
  }
}

/**
 * Send a browser notification if permission is granted.
 * Safe to call when Notification is unsupported or permission denied.
 */
export function sendFocusNotification(title, body, icon) {
  try {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      body,
      icon: icon || getNotificationIcon(),
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch (_) {
    // ignore
  }
}

export const COMPLETION_TITLE = 'Focus Session Complete 🎉';
