import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { themeConfig } from '../utils/themeConfig';
import { API_BASE } from '../utils/api';

const UpdateCard = ({
  update,
  theme,
  onInterested,
  onNotInterested,
  isRemoving,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const sourceName = update.sourceName || update.category || 'News';
  const publishedDate = update.publishedDate || update.date;
  const description = update.summary || update.description;

  const handleInterested = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (update.url) {
        window.open(update.url, '_blank', 'noopener,noreferrer');
      }
      await onInterested(update.id);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNotInterested = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onNotInterested(update.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ease-out"
      style={{
        backgroundColor: theme.accent,
        border: `1px solid ${theme.border}`,
        opacity: isRemoving ? 0 : 1,
        transform: isRemoving ? 'translateX(-100%) scale(0.95)' : 'none',
      }}
    >
      {update.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
          <img
            src={update.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3
            className="font-semibold text-lg flex-1"
            style={{ color: theme.primary }}
          >
            {update.title}
          </h3>
          <span
            className="text-xs px-2 py-1 rounded-full shrink-0"
            style={{
              backgroundColor: `${theme.primary}25`,
              color: theme.primary,
            }}
          >
            {sourceName}
          </span>
        </div>
        <p
          className="text-sm mb-3 line-clamp-2"
          style={{ color: theme.text, opacity: 0.9 }}
        >
          {description}
        </p>
        {publishedDate && (
          <p
            className="text-xs mb-4"
            style={{ color: theme.text, opacity: 0.6 }}
          >
            {publishedDate}
          </p>
        )}

        {!expanded ? (
          <div className="flex flex-col sm:flex-row gap-2">
            {update.url && (
              <a
                href={update.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: theme.primary,
                  color: 'white',
                }}
              >
                Read More →
              </a>
            )}
            <div className="flex gap-2 flex-1">
              <button
                onClick={handleInterested}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                style={{
                  backgroundColor: theme.primary,
                  color: 'white',
                }}
              >
                {loading ? '…' : '👍 Interested'}
              </button>
              <button
                onClick={handleNotInterested}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                style={{
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                }}
              >
                Pass
              </button>
            </div>
          </div>
        ) : (
          <div className="transition-opacity duration-300">
            <p
              className="text-sm mb-4 pb-4 border-b"
              style={{
                color: theme.text,
                opacity: 0.95,
                borderColor: theme.border,
              }}
            >
              {update.fullDescription || description}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {update.url && (
                <a
                  href={update.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: theme.primary, color: 'white' }}
                >
                  Read full article →
                </a>
              )}
              <button
                onClick={() => setExpanded(false)}
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                Collapse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Updates = () => {
  const { currentTheme, selectedGoal } = useTheme();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterGoal, setFilterGoal] = useState(() => selectedGoal || 'default');
  const [removingIds, setRemovingIds] = useState([]);

  const fetchUpdates = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view updates.');
      setLoading(false);
      return;
    }
    try {
      const goalParam = (filterGoal || 'default').toLowerCase();
      const res = await axios.get(
        `${API_BASE}/updates?goal=${encodeURIComponent(goalParam)}&limit=15`,
        { headers: { Authorization: token } }
      );
      setUpdates(res.data.updates || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load updates');
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, [filterGoal]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const handleInterested = async (articleId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_BASE}/updates/preference`,
        { articleId, preference: 'interested', goal: (filterGoal || 'default').toLowerCase() },
        { headers: { Authorization: token } }
      );
    } catch (err) {
      console.error('Failed to save preference:', err);
    }
  };

  const handleNotInterested = async (articleId) => {
    const token = localStorage.getItem('token');
    setRemovingIds((prev) => [...prev, articleId]);
    try {
      await axios.post(
        `${API_BASE}/updates/preference`,
        { articleId, preference: 'not_interested', goal: (filterGoal || 'default').toLowerCase() },
        { headers: { Authorization: token } }
      );
      setTimeout(() => {
        setUpdates((prev) => prev.filter((u) => u.id !== articleId));
        setRemovingIds((prev) => prev.filter((id) => id !== articleId));
        fetchUpdates(true);
      }, 300);
    } catch (err) {
      setRemovingIds((prev) => prev.filter((id) => id !== articleId));
      console.error('Failed to save preference:', err);
    }
  };

  const goalKeys = Object.keys(themeConfig).filter((k) => k !== 'default');

  return (
    <div
      className="min-h-screen p-6 md:p-8 transition-all duration-300"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ color: currentTheme.primary }}
        >
          Current Affairs & Updates
        </h1>
        <p
          className="text-sm"
          style={{ color: currentTheme.text, opacity: 0.8 }}
        >
          Stay updated with news and articles related to your goals. Mark what interests you.
        </p>

        <div className="flex flex-wrap gap-2">
          <span
            className="text-sm font-medium"
            style={{ color: currentTheme.text, opacity: 0.8 }}
          >
            Filter:
          </span>
          {['default', ...goalKeys].map((key) => (
            <button
              key={key}
              onClick={() => setFilterGoal(key)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
              style={{
                backgroundColor:
                  filterGoal === key ? currentTheme.primary : currentTheme.accent,
                color: filterGoal === key ? 'white' : currentTheme.text,
                border: `1px solid ${currentTheme.border}`,
              }}
            >
              {themeConfig[key]?.name || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            className="py-16 text-center rounded-2xl"
            style={{ backgroundColor: currentTheme.accent }}
          >
            <p style={{ color: currentTheme.text, opacity: 0.8 }}>
              Loading updates…
            </p>
          </div>
        ) : error ? (
          <div
            className="py-8 px-6 rounded-2xl text-center"
            style={{
              backgroundColor: currentTheme.accent,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <p style={{ color: currentTheme.primary }}>{error}</p>
            <button
              onClick={fetchUpdates}
              className="mt-4 px-6 py-2 rounded-xl font-medium"
              style={{
                backgroundColor: currentTheme.primary,
                color: 'white',
              }}
            >
              Retry
            </button>
          </div>
        ) : updates.length === 0 ? (
          <div
            className="py-16 text-center rounded-2xl"
            style={{
              backgroundColor: currentTheme.accent,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <p style={{ color: currentTheme.text, opacity: 0.8 }}>
              No updates for this category right now. Try another filter or check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {updates.map((update) => (
              <UpdateCard
                key={update.id}
                update={update}
                theme={currentTheme}
                onInterested={handleInterested}
                onNotInterested={handleNotInterested}
                isRemoving={removingIds.includes(update.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Updates;
