import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/api';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/planner', label: 'Planner' },
  { to: '/updates', label: 'Updates' },
  { to: '/focus', label: 'Focus Timer' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/analytics', label: 'Analytics' },
];

const NavBar = () => {
  const { currentTheme, isDarkMode, toggleDarkMode, resetToDefaultTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_BASE}/auth/me`, { headers: { Authorization: token } })
        .then((res) => setUserInfo(res.data))
        .catch(() => setUserInfo({ username: localStorage.getItem('username') || 'User' }));
    } else {
      setUserInfo({ username: localStorage.getItem('username') || 'User' });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/auth/account`, {
        headers: { Authorization: token },
      });
      resetToDefaultTheme();
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setUserMenuOpen(false);
      window.location.href = '/';
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete account');
    }
  };

  return (
    <nav
      className="border-b transition-all duration-300 ease-out"
      style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img
            src={`${process.env.PUBLIC_URL || ''}/logo.jpeg`}
            alt=""
            className="h-9 w-9 rounded-xl object-contain"
            style={{ border: `1px solid ${currentTheme.border}` }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span
            className="text-xl font-bold tracking-wide transition-colors duration-300"
            style={{ color: currentTheme.primary }}
          >
            FOCUSYNC
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.text,
              border: `1px solid ${currentTheme.border}`,
            }}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ease-out ${
                  isActive ? 'text-white shadow-md' : ''
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: currentTheme.primary, color: 'white' }
                  : { color: currentTheme.text }
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
              style={{ backgroundColor: currentTheme.primary, color: 'white' }}
              title="User menu"
            >
              <span className="text-lg font-semibold">
                {userInfo?.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-12 z-50 min-w-[220px] rounded-xl py-2 shadow-lg"
                style={{
                  backgroundColor: currentTheme.background,
                  border: `2px solid ${currentTheme.border}`,
                }}
              >
                <div className="border-b px-4 py-3" style={{ borderColor: currentTheme.border }}>
                  <p className="font-semibold" style={{ color: currentTheme.primary }}>
                    {userInfo?.username || 'User'}
                  </p>
                  <p className="text-xs" style={{ color: currentTheme.text, opacity: 0.9 }}>
                    {userInfo?.email || ''}
                  </p>
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/dashboard'); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:opacity-90"
                  style={{ color: currentTheme.text }}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:opacity-90"
                  style={{ color: currentTheme.text }}
                >
                  ⚙️ Settings
                </button>
                <hr style={{ borderColor: currentTheme.border, margin: '4px 0' }} />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:opacity-90"
                  style={{ color: currentTheme.text }}
                >
                  🚪 Logout
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); handleDeleteAccount(); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:opacity-90"
                  style={{ color: '#dc2626' }}
                >
                  🗑️ Delete account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
