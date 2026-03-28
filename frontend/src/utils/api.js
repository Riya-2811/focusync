/**
 * Central API base for axios/fetch — works locally and on Render.
 *
 * Priority:
 * 1. REACT_APP_API_URL — set in Render Static Site → Environment (recommended).
 *    Example: https://your-backend-service.onrender.com (no trailing slash, no /api)
 * 2. Development (npm start): unset → relative `/api` uses Create React App proxy → localhost:5000
 * 3. Production build: if REACT_APP_API_URL is unset, uses FALLBACK_PRODUCTION_ORIGIN below
 *    (edit for your backend or always set REACT_APP_API_URL on Render).
 */
const FALLBACK_PRODUCTION_ORIGIN = 'https://focusync-backend.onrender.com';

function resolveOrigin() {
  const fromEnv = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === 'development') {
    return '';
  }

  return (FALLBACK_PRODUCTION_ORIGIN || '').trim().replace(/\/$/, '');
}

const origin = resolveOrigin();

/**
 * @param {string} path - absolute path starting with /, e.g. /api/tasks
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!origin) return p;
  return `${origin}${p}`;
}

/** Full base for REST routes, e.g. `/api` or `https://host.onrender.com/api` */
export const API_BASE = apiUrl('/api');

export default API_BASE;
