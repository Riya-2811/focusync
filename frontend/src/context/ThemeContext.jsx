import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { themeConfig } from '../utils/themeConfig';
import { API_BASE } from '../utils/api';

const ThemeContext = createContext();

const getToken = () => localStorage.getItem('token');

export const ThemeProvider = ({ children }) => {
  const [selectedGoal, setSelectedGoal] = useState(() => {
    const saved = localStorage.getItem('focusync_goal');
    return saved || 'default';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('focusync_darkmode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [customThemePrimary, setCustomThemePrimaryState] = useState(null);

  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('focusync_goal');
    const goal = saved || 'default';
    const isDark = localStorage.getItem('focusync_darkmode') === 'true' ||
      (localStorage.getItem('focusync_darkmode') === null &&
       window.matchMedia('(prefers-color-scheme: dark)').matches);
    const theme = themeConfig[goal];
    return isDark ? theme.dark : theme.light;
  });

  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('focusync_onboarded') === 'true';
  });

  // Load user theme preference when logged in
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/auth/theme`, { headers: { Authorization: token } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.themePrimary) setCustomThemePrimaryState(data.themePrimary);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('focusync_goal', selectedGoal);
    const theme = themeConfig[selectedGoal];
    const base = isDarkMode ? theme.dark : theme.light;
    setCurrentTheme(
      customThemePrimary
        ? { ...base, primary: customThemePrimary }
        : base
    );
  }, [selectedGoal, isDarkMode, customThemePrimary]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('focusync_darkmode', newDarkMode);
  };

  const completeOnboarding = (goal) => {
    setSelectedGoal(goal);
    localStorage.setItem('focusync_onboarded', 'true');
    localStorage.setItem('focusync_goal', goal);
    setIsOnboarded(true);
  };

  const resetOnboarding = () => {
    setSelectedGoal('default');
    setIsOnboarded(false);
    localStorage.removeItem('focusync_onboarded');
    localStorage.removeItem('focusync_goal');
  };

  /** Reset to default light theme and settings. Use on signup and account deletion. */
  const resetToDefaultTheme = () => {
    setSelectedGoal('default');
    setIsDarkMode(false);
    setIsOnboarded(false);
    setCustomThemePrimaryState(null);
    localStorage.setItem('focusync_goal', 'default');
    localStorage.setItem('focusync_darkmode', 'false');
    localStorage.removeItem('focusync_onboarded');
  };

  const setCustomThemePrimary = useCallback((hex) => {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex.trim())) return;
    const trimmed = hex.trim();
    setCustomThemePrimaryState(trimmed);
    const token = getToken();
    if (token) {
      fetch(`${API_BASE}/auth/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ themePrimary: trimmed }),
      }).catch(() => {});
    }
  }, []);

  const clearCustomTheme = useCallback(() => {
    setCustomThemePrimaryState(null);
    const token = getToken();
    if (token) {
      fetch(`${API_BASE}/auth/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ themePrimary: null }),
      }).catch(() => {});
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      selectedGoal,
      setSelectedGoal,
      currentTheme,
      isOnboarded,
      setIsOnboarded,
      completeOnboarding,
      resetOnboarding,
      resetToDefaultTheme,
      isDarkMode,
      toggleDarkMode,
      themeConfig,
      customThemePrimary,
      setCustomThemePrimary,
      clearCustomTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
