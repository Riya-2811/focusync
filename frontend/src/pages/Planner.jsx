import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { goals, subGoalsByMainGoal } from '../utils/themeConfig';

const FOCUS_MINS = 25;
const BREAK_MINS = 5;

const CUSTOM_VALUE = 'custom';

const Planner = () => {
  const { currentTheme, selectedGoal } = useTheme();
  const navigate = useNavigate();
  const [availableMinutes, setAvailableMinutes] = useState(120);
  const [focusGoal, setFocusGoal] = useState(selectedGoal || 'default');
  const [subGoal, setSubGoal] = useState('');
  const [customSubGoal, setCustomSubGoal] = useState('');

  const subGoals = subGoalsByMainGoal[focusGoal] || subGoalsByMainGoal.default;
  const isCustomSubGoal = subGoal === CUSTOM_VALUE;

  const schedule = useMemo(() => {
    const blocks = [];
    let remaining = Math.max(0, parseInt(availableMinutes, 10) || 0);
    let startMin = 0;

    while (remaining > 0) {
      const focusBlock = Math.min(FOCUS_MINS, remaining);
      if (focusBlock > 0) {
        blocks.push({
          type: 'focus',
          duration: focusBlock,
          startMin,
          endMin: startMin + focusBlock,
        });
        startMin += focusBlock;
        remaining -= focusBlock;
      }
      if (remaining > 0) {
        const breakBlock = Math.min(BREAK_MINS, remaining);
        blocks.push({
          type: 'break',
          duration: breakBlock,
          startMin,
          endMin: startMin + breakBlock,
        });
        startMin += breakBlock;
        remaining -= breakBlock;
      }
    }
    return blocks;
  }, [availableMinutes]);

  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleStartSession = (duration) => {
    const effectiveSubGoal = isCustomSubGoal ? (customSubGoal?.trim() || null) : (subGoal || null);
    navigate('/focus', {
      state: { plannedDuration: duration, plannedGoal: focusGoal, plannedSubGoal: effectiveSubGoal },
    });
  };

  const handleMainGoalChange = (value) => {
    setFocusGoal(value);
    setSubGoal('');
    setCustomSubGoal('');
  };

  return (
    <div
      className="min-h-screen p-6 md:p-8 transition-all duration-300"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
      }}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
          📋 Daily Focus Planner
        </h1>
        <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.9 }}>
          Generate a Pomodoro-style schedule (25 min focus, 5 min break). Start any focus block from here.
        </p>

        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{
            backgroundColor: currentTheme.accent,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: currentTheme.primary }}>
            Your day
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                Available time (minutes)
              </label>
              <input
                type="number"
                min={30}
                max={480}
                step={15}
                value={availableMinutes}
                onChange={(e) => setAvailableMinutes(e.target.value)}
                className="w-full rounded-lg border-2 px-4 py-2 focus:outline-none"
                style={{
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.background,
                  color: currentTheme.text,
                }}
              />
              <p className="text-xs mt-1" style={{ color: currentTheme.text, opacity: 0.7 }}>
                e.g. 120 = 2 hours
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                Main focus goal
              </label>
              <select
                value={focusGoal}
                onChange={(e) => handleMainGoalChange(e.target.value)}
                className="w-full rounded-lg border-2 px-4 py-2 focus:outline-none"
                style={{
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.background,
                  color: currentTheme.text,
                }}
              >
                <option value="default">Default</option>
                {goals.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.emoji} {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                Sub-goal
              </label>
              <select
                value={subGoal}
                onChange={(e) => setSubGoal(e.target.value)}
                className="w-full rounded-lg border-2 px-4 py-2 focus:outline-none"
                style={{
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.background,
                  color: currentTheme.text,
                }}
              >
                <option value="">— Select sub-goal —</option>
                {subGoals.map((sg) => (
                  <option key={sg.value} value={sg.value}>
                    {sg.label}
                  </option>
                ))}
              </select>
            </div>
            {isCustomSubGoal && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                  Enter your custom sub-goal
                </label>
                <input
                  type="text"
                  value={customSubGoal}
                  onChange={(e) => setCustomSubGoal(e.target.value)}
                  placeholder="e.g. React.js, Spanish, Thesis chapter 2"
                  className="w-full rounded-lg border-2 px-4 py-2 focus:outline-none"
                  style={{
                    borderColor: currentTheme.border,
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: currentTheme.primary }}>
            Generated schedule
          </h2>
          {schedule.length === 0 ? (
            <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
              Enter at least 30 minutes to generate blocks.
            </p>
          ) : (
            <div className="space-y-3">
              {schedule.map((block, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
                  style={{
                    backgroundColor: block.type === 'focus' ? `${currentTheme.primary}18` : currentTheme.accent,
                    border: `2px solid ${block.type === 'focus' ? currentTheme.primary : currentTheme.border}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-lg text-lg"
                      style={{
                        backgroundColor: block.type === 'focus' ? currentTheme.primary : currentTheme.border,
                        color: block.type === 'focus' ? '#fff' : currentTheme.text,
                      }}
                    >
                      {block.type === 'focus' ? '⏱' : '☕'}
                    </span>
                    <div>
                      <p className="font-semibold" style={{ color: currentTheme.text }}>
                        {block.type === 'focus' ? 'Focus' : 'Break'} · {block.duration} min
                      </p>
                      <p className="text-xs" style={{ color: currentTheme.text, opacity: 0.8 }}>
                        {formatTime(block.startMin)} – {formatTime(block.endMin)}
                      </p>
                    </div>
                  </div>
                  {block.type === 'focus' && (
                    <button
                      type="button"
                      onClick={() => handleStartSession(block.duration)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                      style={{ backgroundColor: currentTheme.primary }}
                    >
                      Start session
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planner;
