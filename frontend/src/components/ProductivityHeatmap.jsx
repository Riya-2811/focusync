import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/api';

const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLevel(minutes, maxMinutes) {
  if (minutes <= 0) return 0;
  if (maxMinutes <= 0) return 1;
  const ratio = minutes / maxMinutes;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const ProductivityHeatmap = ({ theme, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE}/focus/heatmap`, { headers: { Authorization: token } })
      .then((res) => setData(res.data?.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [token]);

  const byDate = React.useMemo(() => {
    const map = {};
    (data || []).forEach((d) => {
      map[d.date] = { minutes: d.minutes || 0, sessions: d.sessions || 0 };
    });
    return map;
  }, [data]);

  const maxMinutes = React.useMemo(() => {
    return Math.max(1, ...data.map((d) => d.minutes || 0));
  }, [data]);

  const grid = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS * DAYS_PER_WEEK - 1)); // 84 days: start to today inclusive
    const todayStr = today.toISOString().split('T')[0];
    const cells = [];
    for (let col = 0; col < WEEKS; col++) {
      for (let row = 0; row < DAYS_PER_WEEK; row++) {
        const d = new Date(start);
        d.setDate(d.getDate() + col * DAYS_PER_WEEK + row);
        const dateStr = d.toISOString().split('T')[0];
        const agg = byDate[dateStr] || { minutes: 0, sessions: 0 };
        const level = getLevel(agg.minutes, maxMinutes);
        const isToday = dateStr === todayStr;
        cells.push({
          row,
          col,
          dateStr,
          minutes: agg.minutes,
          sessions: agg.sessions,
          level,
          isToday,
        });
      }
    }
    return cells;
  }, [byDate, maxMinutes]);

  const getBackgroundColor = (level) => {
    if (level === 0) return theme.border;
    return theme.primary;
  };

  const getOpacity = (level) => {
    if (level === 0) return 0.35;
    return level === 1 ? 0.4 : level === 2 ? 0.6 : level === 3 ? 0.85 : 1;
  };

  if (loading) {
    return (
      <div
        className="rounded-xl p-6 flex items-center justify-center min-h-[200px]"
        style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}
      >
        <span className="text-sm" style={{ color: theme.text, opacity: 0.8 }}>
          Loading heatmap…
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}
    >
      <p className="text-xs mb-2 flex flex-wrap items-center gap-3" style={{ color: theme.text, opacity: 0.9 }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className="inline-block w-4 h-4 rounded-sm"
            style={{
              backgroundColor: level === 0 ? theme.border : theme.primary,
              opacity: level === 0 ? 0.35 : getOpacity(level),
            }}
          />
        ))}
        <span>More</span>
      </p>
      <div className="flex gap-1">
        <div className="flex flex-col justify-around text-[10px] pr-1" style={{ color: theme.text, opacity: 0.7 }}>
          {DAY_LABELS.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div
          className="grid gap-0.5 flex-1"
          style={{
            gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${DAYS_PER_WEEK}, minmax(0, 1fr))`,
            aspectRatio: '12 / 7',
            maxWidth: '100%',
          }}
        >
          {grid.map((cell) => (
            <div
              key={`${cell.dateStr}-${cell.col}-${cell.row}`}
              className="w-full aspect-square rounded-sm cursor-default"
              style={{
                backgroundColor: getBackgroundColor(cell.level),
                opacity: getOpacity(cell.level),
                border: cell.isToday ? `2px solid ${theme.text}` : 'none',
              }}
              onMouseEnter={() =>
                setTooltip({
                  x: cell.col,
                  y: cell.row,
                  date: cell.dateStr,
                  minutes: cell.minutes,
                  sessions: cell.sessions,
                })
              }
              onMouseLeave={() => setTooltip(null)}
              title={`${cell.dateStr}: ${cell.minutes} min, ${cell.sessions} session(s)`}
            />
          ))}
        </div>
      </div>
      {tooltip && (
        <div
          className="rounded-lg px-3 py-2 text-xs mt-2 border-2"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.primary,
            color: theme.text,
          }}
        >
          <span className="font-semibold" style={{ color: theme.primary }}>
            {new Date(tooltip.date + 'T12:00:00').toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            :{' '}
          </span>
          {tooltip.minutes} min focus · {tooltip.sessions} session{tooltip.sessions !== 1 ? 's' : ''} completed
        </div>
      )}
      <p className="text-xs mt-2" style={{ color: theme.text, opacity: 0.7 }}>
        Last 12 weeks · Intensity = focus time that day
      </p>
    </div>
  );
};

export default ProductivityHeatmap;
