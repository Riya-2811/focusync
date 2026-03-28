import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getAffairsForGoal } from '../utils/affairsData';
import { API_BASE } from '../utils/api';

const AffairCard = ({
  affair,
  theme,
  expanded,
  onInterested,
  onNotInterested,
  onToggleExpand,
  isRemoving,
}) => {
  const [loading, setLoading] = useState(false);

  const sourceName = affair.sourceName || affair.category || 'News';
  const publishedDate = affair.publishedDate || affair.date;
  const summary = affair.summary || affair.description;
  const fullDescription = affair.fullDescription || summary;

  const handleInterested = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (affair.url) {
        window.open(affair.url, '_blank', 'noopener,noreferrer');
      }
      await onInterested(affair.id);
    } finally {
      setLoading(false);
    }
  };

  const handleNotInterested = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onNotInterested(affair.id);
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
      {affair.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
          <img
            src={affair.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-lg flex-1" style={{ color: theme.primary }}>
            {affair.title}
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
        <p className="text-sm mb-3" style={{ color: theme.text, opacity: 0.9 }}>
          {expanded ? fullDescription : (summary?.slice(0, 120) + (summary?.length > 120 ? '…' : ''))}
        </p>
        {publishedDate && (
          <p className="text-xs mb-4" style={{ color: theme.text, opacity: 0.6 }}>
            {publishedDate}
          </p>
        )}
        {!expanded ? (
          <div className="flex flex-col sm:flex-row gap-2">
            {affair.url && (
              <a
                href={affair.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: theme.primary, color: 'white' }}
              >
                Read More →
              </a>
            )}
            <div className="flex gap-2 flex-1">
              <button
                onClick={handleInterested}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
                style={{ backgroundColor: theme.primary, color: 'white' }}
              >
                {loading ? '…' : '👍 Interested'}
              </button>
              <button
                onClick={handleNotInterested}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
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
          <div className="flex flex-wrap items-center gap-2">
            {affair.url && (
              <a
                href={affair.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: theme.primary, color: 'white' }}
              >
                Read full article →
              </a>
            )}
            <button
              onClick={() => onToggleExpand?.(affair.id)}
              className="text-sm font-medium"
              style={{ color: theme.primary }}
            >
              Collapse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CurrentAffairs = ({ goal }) => {
  const { currentTheme } = useTheme();
  const [affairs, setAffairs] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [removingIds, setRemovingIds] = useState([]);
  const [useApi, setUseApi] = useState(true);

  const fetchAffairs = useCallback((silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios
      .get(`${API_BASE}/updates?goal=${encodeURIComponent(goal)}&limit=6`, {
        headers: { Authorization: token },
      })
      .then((res) => setAffairs(res.data.updates || []))
      .catch(() => {
        if (!silent) {
          const mock = getAffairsForGoal(goal);
          setAffairs(
            mock.map((a) => ({
              id: String(a.id),
              title: a.title,
              summary: a.description,
              fullDescription: a.description,
              category: a.category,
              date: a.date,
            }))
          );
          setUseApi(false);
        }
      });
  }, [goal]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      const mock = getAffairsForGoal(goal);
      setAffairs(
        mock.map((a) => ({
          id: String(a.id),
          title: a.title,
          summary: a.description,
          fullDescription: a.description,
          category: a.category,
          date: a.date,
        }))
      );
      setUseApi(false);
      return;
    }
    fetchAffairs();
  }, [goal, fetchAffairs]);

  const handleInterested = async (id) => {
    if (!useApi) {
      setExpandedIds((prev) => new Set([...prev, id]));
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_BASE}/updates/preference`,
        { articleId: id, preference: 'interested', goal },
        { headers: { Authorization: token } }
      );
    } catch (_) {}
    setExpandedIds((prev) => new Set([...prev, id]));
  };

  const handleToggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNotInterested = async (id) => {
    setRemovingIds((prev) => [...prev, id]);
    if (useApi) {
      const token = localStorage.getItem('token');
      try {
        await axios.post(
          `${API_BASE}/updates/preference`,
          { articleId: id, preference: 'not_interested', goal },
          { headers: { Authorization: token } }
        );
      } catch (_) {}
    }
    setTimeout(() => {
      setAffairs((prev) => prev.filter((a) => a.id !== id));
      setRemovingIds((prev) => prev.filter((rid) => rid !== id));
      if (useApi) fetchAffairs(true);
    }, 300);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold" style={{ color: currentTheme.primary }}>
          Current Affairs & News
        </h2>
        <Link
          to="/updates"
          className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300"
          style={{
            backgroundColor: currentTheme.primary,
            color: 'white',
          }}
        >
          See all →
        </Link>
      </div>
      <p
        className="text-sm mb-4"
        style={{ color: currentTheme.text, opacity: 0.8 }}
      >
        Stay updated with news and articles related to your focus area.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {affairs.map((affair) => (
          <AffairCard
            key={affair.id}
            affair={affair}
            theme={currentTheme}
            expanded={expandedIds.has(affair.id)}
            onInterested={handleInterested}
            onNotInterested={handleNotInterested}
            onToggleExpand={handleToggleExpand}
            isRemoving={removingIds.includes(affair.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CurrentAffairs;
