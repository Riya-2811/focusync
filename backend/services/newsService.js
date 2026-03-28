const path = require('path');
const fs = require('fs');

// Goal → search keywords per user spec
const GOAL_TO_QUERY = {
  studies: ['education', 'science'],
  work: ['business', 'productivity'],
  workout: ['fitness', 'health'],
  fitness: ['health', 'fitness'],
  health: ['health', 'wellness'],
  meditation: ['meditation', 'mindfulness'],
  skillimprovement: ['technology', 'programming'],
  reading: ['education', 'books'],
  creative: ['design', 'art'],
  wellness: ['wellness', 'health'],
  personaldevelopment: ['self improvement'],
  sociallife: ['lifestyle'],
  hobbies: ['lifestyle', 'hobbies'],
  default: ['productivity'],
};

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const cache = new Map();

const curatedPath = path.join(__dirname, '../data/curatedUpdates.json');
let curatedData;
try {
  curatedData = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
} catch {
  curatedData = { default: [] };
}

function formatPublishedDate(publishedAt) {
  if (!publishedAt) return '';
  const d = new Date(publishedAt);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function fetchFromGNews(goal, limit = 10) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];
  const g = (goal || 'default').toLowerCase();
  const queries = GOAL_TO_QUERY[g] || GOAL_TO_QUERY.default;
  const q = queries[0];
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&apikey=${apiKey}&max=${Math.min(limit, 10)}&lang=en`
    );
    const data = await res.json();
    if (data.articles && Array.isArray(data.articles)) {
      return data.articles.map((a, i) => ({
        id: `gnews-${Date.now()}-${i}-${(a.title || '').slice(0, 30).replace(/\s/g, '_')}`,
        title: a.title || 'Untitled',
        summary: a.description || a.title || '',
        fullDescription: a.content || a.description || a.title || '',
        category: a.source?.name || 'News',
        sourceName: a.source?.name || 'News',
        date: formatPublishedDate(a.publishedAt),
        publishedDate: formatPublishedDate(a.publishedAt),
        imageUrl: a.image || null,
        url: a.url || '',
        source: 'gnews',
      }));
    }
  } catch (err) {
    console.error('[newsService] GNews error:', err.message);
  }
  return [];
}

function mapCuratedArticle(a) {
  return {
    ...a,
    sourceName: a.category || 'Curated',
    publishedDate: a.date || '',
    imageUrl: a.imageUrl || null,
    source: a.source || 'curated',
  };
}

/**
 * Curated JSON only defines a subset of goals. For goals with no dedicated list,
 * merge related categories so filters don't all show the same "default" feed.
 */
function getCuratedForGoal(goal) {
  const normalized = (goal || 'default').toLowerCase();
  const direct = curatedData[normalized];
  if (direct && direct.length) {
    return direct.map(mapCuratedArticle);
  }

  const FALLBACK_CHAINS = {
    reading: ['studies', 'default'],
    skillimprovement: ['work', 'studies', 'default'],
    personaldevelopment: ['wellness', 'meditation', 'default'],
    sociallife: ['work', 'default'],
    hobbies: ['creative', 'default'],
    fitness: ['workout', 'health', 'default'],
  };

  const chain = FALLBACK_CHAINS[normalized] || ['default'];
  const seen = new Set();
  const merged = [];
  for (const k of chain) {
    const arr = curatedData[k] || [];
    for (const a of arr) {
      if (a && a.id && !seen.has(a.id)) {
        seen.add(a.id);
        merged.push(a);
      }
    }
  }
  return merged.map(mapCuratedArticle);
}

async function getUpdates(goal, excludeIds = [], limit = 15) {
  const g = (goal || 'default').toLowerCase();
  const cacheKey = `${g}-${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data.filter((a) => !excludeIds.includes(a.id)).slice(0, limit);
  }

  const curated = getCuratedForGoal(g);
  let apiItems = [];
  if (process.env.GNEWS_API_KEY) {
    apiItems = await fetchFromGNews(g, Math.max(limit, 10));
  }

  const combined = [...apiItems, ...curated];
  cache.set(cacheKey, { data: combined, timestamp: Date.now() });

  return combined
    .filter((a) => !excludeIds.includes(a.id))
    .slice(0, limit);
}

module.exports = { getUpdates, getCuratedForGoal };
