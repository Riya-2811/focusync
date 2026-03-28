import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import TimerDisplay from '../components/TimerDisplay';
import TimerControls from '../components/TimerControls';
import DeepFocusModal from '../components/DeepFocusModal';
import SessionSummaryModal from '../components/SessionSummaryModal';
import { getInsightForSession } from '../utils/focusCoach';
import { API_BASE } from '../utils/api';
import {
  NOTIFICATION_INTERVAL_MS,
  getPeriodicNotificationBody,
  getCompletionBody,
  sendFocusNotification,
  COMPLETION_TITLE,
} from '../utils/focusNotifications';

const FOCUS_TECHNIQUES = [
  { id: 'pomodoro', name: 'Pomodoro', focusMins: 25, shortBreakMins: 5, longBreakMins: 15, description: '25 min focus, 5 min short break, 15 min long break' },
  { id: '52-17', name: '52/17', focusMins: 52, shortBreakMins: 17, longBreakMins: 17, description: '52 min focus, 17 min break' },
  { id: '90-20', name: '90-Minute Ultra', focusMins: 90, shortBreakMins: 10, longBreakMins: 20, description: '90 min deep work, 10–20 min breaks' },
  { id: '15-5', name: 'Micro (15/5)', focusMins: 15, shortBreakMins: 5, longBreakMins: 15, description: '15 min focus, 5 min short break' },
  { id: '50-10', name: '50/10', focusMins: 50, shortBreakMins: 10, longBreakMins: 20, description: '50 min focus, 10 min short break' },
  { id: '45-15', name: 'Time Blocking (45/15)', focusMins: 45, shortBreakMins: 15, longBreakMins: 30, description: '45 min blocks, 15 min short break' },
  { id: '30-5', name: '30/5', focusMins: 30, shortBreakMins: 5, longBreakMins: 15, description: '30 min focus, 5 min short break' },
  { id: 'flowtime', name: 'Flowtime', focusMins: 90, shortBreakMins: 15, longBreakMins: 30, description: '90 min flow, 15–30 min breaks' },
  { id: 'custom-20', name: '20-Minute Sprints', focusMins: 20, shortBreakMins: 5, longBreakMins: 10, description: '20 min focus, 5 min short break' },
];

const getModesFromTechnique = (technique) => ({
  focus: { label: 'Focus', duration: technique.focusMins * 60 },
  short: { label: 'Short Break', duration: technique.shortBreakMins * 60 },
  long: { label: 'Long Break', duration: technique.longBreakMins * 60 },
});

const TECHNIQUE_STORAGE_KEY = 'focusync_focus_technique';
const NOTIFICATIONS_STORAGE_KEY = 'focusync_focus_notifications';
const getTechniqueById = (id) => FOCUS_TECHNIQUES.find((t) => t.id === id) || FOCUS_TECHNIQUES[0];

const TAB_TITLE_SUFFIX = ' – Focusync';

const formatTitleTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const exitFullscreen = () => {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
  } catch {}
};

const playNotification = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 520;
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => ctx.close();
  } catch {
    // fallback: no sound support
  }
};

const FocusTimer = () => {
  const location = useLocation();
  const { currentTheme, selectedGoal, setSelectedGoal } = useTheme();
  const plannedDurationRef = useRef(null);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState(() => {
    const saved = localStorage.getItem(TECHNIQUE_STORAGE_KEY);
    return saved && FOCUS_TECHNIQUES.some((t) => t.id === saved) ? saved : 'pomodoro';
  });
  const selectedTechnique = useMemo(() => getTechniqueById(selectedTechniqueId), [selectedTechniqueId]);
  const currentModes = useMemo(() => getModesFromTechnique(selectedTechnique), [selectedTechnique]);
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const t = getTechniqueById(localStorage.getItem(TECHNIQUE_STORAGE_KEY) || 'pomodoro');
    return t.focusMins * 60;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showDeepFocusModal, setShowDeepFocusModal] = useState(false);
  const [deepFocusActive, setDeepFocusActive] = useState(false);
  const [distractionsCount, setDistractionsCount] = useState(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [quickNoteInput, setQuickNoteInput] = useState('');
  const [showSessionSummaryModal, setShowSessionSummaryModal] = useState(false);
  const [sessionSummaryData, setSessionSummaryData] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return saved !== 'false';
  });
  const intervalRef = useRef(null);
  const notificationIntervalRef = useRef(null);
  const endTimeRef = useRef(null);
  const modeRef = useRef(mode);
  const originalTitleRef = useRef(document.title);
  const deepFocusActiveRef = useRef(false);
  const distractionsRef = useRef(0);
  const secondsLeftRef = useRef(secondsLeft);
  const isRunningRef = useRef(isRunning);
  const sessionNotesRef = useRef([]);
  const notificationsEnabledRef = useRef(notificationsEnabled);
  const techniqueForNotificationRef = useRef(null);
  const token = localStorage.getItem('token');

  notificationsEnabledRef.current = notificationsEnabled;
  techniqueForNotificationRef.current =
    mode === 'focus'
      ? {
          techniqueName: selectedTechnique.name,
          totalDurationMinutes: currentModes.focus.duration / 60,
        }
      : null;
  deepFocusActiveRef.current = deepFocusActive;
  distractionsRef.current = distractionsCount;
  secondsLeftRef.current = secondsLeft;
  isRunningRef.current = isRunning;
  sessionNotesRef.current = sessionNotes;

  const saveFocusSession = async (duration, goalCategory = 'General', options = {}) => {
    try {
      await axios.post(
        `${API_BASE}/focus`,
        { duration, goalCategory, ...options },
        { headers: { Authorization: token } }
      );
    } catch (err) {
      console.error('[FocusTimer] Error saving session:', err);
    }
  };

  // Apply planner navigation state once on mount only
  useEffect(() => {
    const planned = location.state?.plannedDuration;
    if (planned != null && planned > 0) {
      plannedDurationRef.current = planned;
      setMode('focus');
      setSecondsLeft(planned * 60);
      if (location.state?.plannedGoal && typeof setSelectedGoal === 'function') {
        setSelectedGoal(location.state.plannedGoal);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: read location.state once
  }, []);

  useEffect(() => {
    modeRef.current = mode;
    if (plannedDurationRef.current != null) {
      setSecondsLeft(plannedDurationRef.current * 60);
      plannedDurationRef.current = null;
    } else {
      setSecondsLeft(currentModes[mode].duration);
    }
  }, [mode, currentModes]);

  useEffect(() => {
    if (!isRunning) return;
    if (intervalRef.current) return;

    if (endTimeRef.current == null) {
      endTimeRef.current = Date.now() + secondsLeftRef.current * 1000;
    }

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
      setSecondsLeft(remaining);
    }, 200);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      playNotification();

      const wasDeepFocus = deepFocusActiveRef.current;
      const distractions = distractionsRef.current;

      if (notificationIntervalRef.current) {
        window.clearInterval(notificationIntervalRef.current);
        notificationIntervalRef.current = null;
      }
      if (wasDeepFocus) {
        exitFullscreen();
        setDeepFocusActive(false);
        document.title = originalTitleRef.current;
        setShowCompletionNotification(true);
        setTimeout(() => setShowCompletionNotification(false), 4000);
      }
      endTimeRef.current = null;

      if (modeRef.current === 'focus') {
        const focusDurationMinutes = currentModes.focus.duration / 60;
        const focusScore = Math.max(0, Math.min(100, 100 - distractions * 4));
        const notesToSave = sessionNotesRef.current || [];
        saveFocusSession(focusDurationMinutes, selectedGoal, {
          distractions,
          completed: true,
          focusScore,
          notes: notesToSave,
        });
        setDistractionsCount(0);
        setSessionNotes([]);
        sessionNotesRef.current = [];

        const sessionForCoach = {
          duration: focusDurationMinutes,
          distractions,
          focusScore,
          date: new Date().toISOString(),
          goalCategory: selectedGoal,
        };
        const insight = getInsightForSession(sessionForCoach, []);
        setSessionSummaryData({
          session: {
            duration: focusDurationMinutes,
            focusScore,
            distractions,
          },
          insightMessage: insight.message,
        });
        setShowSessionSummaryModal(true);
        if (notificationsEnabledRef.current) {
          const technique = {
            techniqueName: selectedTechnique.name,
            totalDurationMinutes: focusDurationMinutes,
          };
          sendFocusNotification(COMPLETION_TITLE, getCompletionBody(technique));
        }

        setSessionCount((prev) => {
          const nextCount = prev + 1;
          const nextMode = nextCount % 4 === 0 ? 'long' : 'short';
          setMode(nextMode);
          return nextCount;
        });
      } else {
        setMode('focus');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- timer completion: avoid re-subscribing saveFocusSession every render
  }, [secondsLeft, isRunning, sessionCount, selectedGoal, currentModes]);

  useEffect(() => {
    if (!deepFocusActive || !isRunning) return;
    originalTitleRef.current = document.title;
    return () => { document.title = originalTitleRef.current; };
  }, [deepFocusActive, isRunning]);

  useEffect(() => {
    if (!deepFocusActive || !isRunning) return;
    document.title = `⏳ ${formatTitleTime(secondsLeft)} left${TAB_TITLE_SUFFIX}`;
  }, [deepFocusActive, isRunning, secondsLeft]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!deepFocusActiveRef.current || !document.hidden) return;
      setDistractionsCount((c) => c + 1);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    let timeoutId;
    const handleVisibility = () => {
      if (!document.hidden && deepFocusActiveRef.current && distractionsRef.current > 0) {
        setShowTabSwitchWarning(true);
        timeoutId = setTimeout(() => setShowTabSwitchWarning(false), 5000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isRunning || mode !== 'focus' || !notificationsEnabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (notificationIntervalRef.current) {
      window.clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
    const technique = {
      techniqueName: selectedTechnique.name,
      totalDurationMinutes: currentModes.focus.duration / 60,
    };
    techniqueForNotificationRef.current = technique;
    const id = window.setInterval(() => {
      const remaining = secondsLeftRef.current;
      if (remaining <= 0) return;
      const minutesLeft = remaining / 60;
      const techniqueSnapshot = techniqueForNotificationRef.current;
      const body = getPeriodicNotificationBody(minutesLeft, techniqueSnapshot);
      sendFocusNotification('FOCUSYNC – Stay Focused', body);
    }, NOTIFICATION_INTERVAL_MS);
    notificationIntervalRef.current = id;
    return () => {
      if (notificationIntervalRef.current === id) {
        window.clearInterval(id);
        notificationIntervalRef.current = null;
      }
    };
  }, [isRunning, mode, notificationsEnabled, selectedTechnique.name, selectedTechnique.id, currentModes.focus.duration]);

  const startTimer = () => {
    const initial = secondsLeft <= 0 ? currentModes[mode].duration : secondsLeft;
    if (secondsLeft <= 0) setSecondsLeft(currentModes[mode].duration);
    endTimeRef.current = Date.now() + initial * 1000;
    setIsRunning(true);
  };

  const handleStart = () => {
    if (mode === 'focus') {
      setSessionNotes([]);
      sessionNotesRef.current = [];
      setShowDeepFocusModal(true);
    } else {
      startTimer();
    }
  };

  const handleAddQuickNote = () => {
    const text = quickNoteInput.trim();
    if (!text) return;
    const note = { text, createdAt: new Date().toISOString() };
    setSessionNotes((prev) => [...prev, note]);
    sessionNotesRef.current = [...sessionNotesRef.current, note];
    setQuickNoteInput('');
  };

  const handleEnableFocusMode = () => {
    setShowDeepFocusModal(false);
    setDeepFocusActive(true);
    setDistractionsCount(0);
    setSessionNotes([]);
    sessionNotesRef.current = [];
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    startTimer();
    try {
      const el = document.documentElement;
      if (el && typeof el.requestFullscreen === 'function') {
        el.requestFullscreen().catch(() => {});
      }
    } catch (_) {}
  };

  const handleStartNormally = () => {
    setShowDeepFocusModal(false);
    setSessionNotes([]);
    sessionNotesRef.current = [];
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    startTimer();
  };

  const handlePause = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (notificationIntervalRef.current) {
      window.clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
    if (deepFocusActive) {
      exitFullscreen();
      setDeepFocusActive(false);
      document.title = originalTitleRef.current;
    }
  };

  const handleReset = () => {
    handlePause();
    setSecondsLeft(currentModes[mode].duration);
    setDistractionsCount(0);
  };

  const handleTechniqueChange = (e) => {
    const newId = e.target.value;
    if (isRunning) handlePause();
    setSelectedTechniqueId(newId);
    localStorage.setItem(TECHNIQUE_STORAGE_KEY, newId);
    const nextTechnique = getTechniqueById(newId);
    const nextModes = getModesFromTechnique(nextTechnique);
    setSecondsLeft(nextModes.focus.duration);
    setMode('focus');
  };

  const handleModeChange = (targetMode) => {
    handlePause();
    setMode(targetMode);
  };

  const focusHoursText = useMemo(() => {
    const minutes = Math.floor((sessionCount * currentModes.focus.duration) / 60);
    return `${minutes} min focused`;
  }, [sessionCount, currentModes]);

  const handleNotificationsToggle = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(next));
    if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 transition-all duration-300 ease-out">
      <DeepFocusModal
        isOpen={showDeepFocusModal}
        onEnableFocusMode={handleEnableFocusMode}
        onStartNormally={handleStartNormally}
      />
      <SessionSummaryModal
        isOpen={showSessionSummaryModal}
        onClose={() => setShowSessionSummaryModal(false)}
        session={sessionSummaryData?.session}
        insightMessage={sessionSummaryData?.insightMessage}
      />

      {showTabSwitchWarning && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
          style={{
            backgroundColor: currentTheme.primary,
            color: 'white',
            border: `2px solid ${currentTheme.border}`,
          }}
          role="alert"
        >
          Focus interrupted: You switched tabs during the session.
        </div>
      )}

      {showCompletionNotification && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
          style={{
            backgroundColor: currentTheme.primary,
            color: 'white',
          }}
        >
          Session complete. Great focus!
        </div>
      )}

      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl transition-colors duration-300" style={{ color: currentTheme.primary }}>
          Focus Timer
        </h1>
        <p className="text-sm transition-colors duration-300" style={{ color: currentTheme.text }}>
          Use focused sessions to build momentum. You've completed {sessionCount} session{sessionCount === 1 ? '' : 's'}.
        </p>
        <div className="text-xs transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.9 }}>
          {focusHoursText}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-3">
          <span className="text-sm font-medium transition-colors duration-300" style={{ color: currentTheme.text }}>
            Focus technique:
          </span>
          <select
            value={selectedTechniqueId}
            onChange={handleTechniqueChange}
            className="rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.text,
              border: `2px solid ${currentTheme.border}`,
            }}
            aria-label="Select focus technique"
          >
            {FOCUS_TECHNIQUES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.focusMins}/{t.shortBreakMins}/{t.longBreakMins} min)
              </option>
            ))}
          </select>
        </div>
        {selectedTechnique.description && (
          <p className="text-xs mt-1 transition-colors duration-300" style={{ color: currentTheme.text, opacity: 0.8 }}>
            {selectedTechnique.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            try {
              if (isFullscreen) {
                exitFullscreen();
              } else {
                const el = document.documentElement;
                if (el && typeof el.requestFullscreen === 'function') {
                  el.requestFullscreen().catch(() => {});
                }
              }
            } catch (_) {}
          }}
          className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.primary,
            border: `2px solid ${currentTheme.primary}`,
          }}
        >
          {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        </button>
        <label
          className="flex items-center gap-2 cursor-pointer rounded-xl px-4 py-2 text-sm transition-all duration-200"
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.text,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={handleNotificationsToggle}
            className="w-4 h-4 rounded"
            style={{ accentColor: currentTheme.primary }}
          />
          <span>Enable Focus Notifications</span>
        </label>
      </div>

      <div className="flex flex-col items-center gap-10">
        <TimerDisplay time={secondsLeft} mode={mode} />
        <TimerControls
          isRunning={isRunning}
          onStart={handleStart}
          onResume={startTimer}
          onPause={handlePause}
          onReset={handleReset}
          onModeChange={handleModeChange}
          mode={mode}
          secondsLeft={secondsLeft}
          durationForMode={currentModes[mode].duration}
        />

        {(isRunning && mode === 'focus') && (
          <div
            className="w-full max-w-md rounded-xl p-4 transition-all duration-300"
            style={{
              backgroundColor: currentTheme.accent,
              border: `2px solid ${currentTheme.border}`,
            }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.primary }}>
              Quick capture
            </p>
            <p className="text-xs mb-2" style={{ color: currentTheme.text, opacity: 0.8 }}>
              Jot ideas or reminders; they’ll be saved with this session.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickNoteInput}
                onChange={(e) => setQuickNoteInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuickNote())}
                placeholder="Type a note..."
                className="flex-1 rounded-lg border-2 px-3 py-2 text-sm focus:outline-none"
                style={{
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.background,
                  color: currentTheme.text,
                }}
              />
              <button
                type="button"
                onClick={handleAddQuickNote}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white shrink-0"
                style={{ backgroundColor: currentTheme.primary }}
              >
                Add
              </button>
            </div>
            {sessionNotes.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs max-h-24 overflow-y-auto" style={{ color: currentTheme.text, opacity: 0.9 }}>
                {sessionNotes.map((n, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="shrink-0">•</span>
                    <span>{n.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusTimer;
