import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/api';
import SettingsSidebar from '../components/settings/SettingsSidebar';
import AccountSettings from '../components/settings/AccountSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import FocusSettings from '../components/settings/FocusSettings';
import ProductivitySettings from '../components/settings/ProductivitySettings';
import ThemeSettings from '../components/settings/ThemeSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import DangerZone from '../components/settings/DangerZone';

const PREFS_KEY = 'focusync_settings_preferences_v1';

const defaultPrefs = {
  focusMinutes: 25,
  breakMinutes: 5,
  autoStartNextSession: false,
  soundNotifications: true,
  desktopNotifications: true,
  dailyFocusGoalHours: 2,
  weeklyReports: true,
  productivityReminders: true,
  distractionAlerts: true,
  emailNotifications: false,
  sessionCompletionAlerts: true,
  breakReminders: true,
  weeklyProductivitySummary: true,
};

const sections = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'security', label: 'Password & Security', icon: '🔐' },
  { id: 'focus', label: 'Focus Preferences', icon: '⏱️' },
  { id: 'productivity', label: 'Productivity', icon: '📈' },
  { id: 'theme', label: 'Theme & Appearance', icon: '🎨' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Data & Privacy', icon: '🛡️' },
];

const getInitialPrefs = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    return { ...defaultPrefs, ...parsed };
  } catch {
    return defaultPrefs;
  }
};

const SettingsPage = () => {
  const { currentTheme, isDarkMode, toggleDarkMode, resetToDefaultTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('account');
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [prefs, setPrefs] = useState(getInitialPrefs);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('focusync_theme_mode') || (isDarkMode ? 'dark' : 'light'));
  const [accountMsg, setAccountMsg] = useState(null);
  const [securityMsg, setSecurityMsg] = useState(null);
  const [privacyMsg, setPrivacyMsg] = useState(null);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/auth/me`, { headers: { Authorization: token } })
      .then((res) => {
        setProfile({
          username: res.data?.username || localStorage.getItem('username') || '',
          email: res.data?.email || '',
        });
      })
      .catch(() => {
        setProfile((prev) => ({
          username: prev.username || localStorage.getItem('username') || 'User',
          email: prev.email || '',
        }));
      });

    axios
      .get(`${API_BASE}/auth/preferences`, { headers: { Authorization: token } })
      .then((res) => {
        const serverPrefs = res.data?.preferences;
        if (serverPrefs && typeof serverPrefs === 'object') {
          setPrefs((prev) => ({ ...prev, ...serverPrefs }));
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const timer = setTimeout(() => {
      axios
        .put(
          `${API_BASE}/auth/preferences`,
          { preferences: prefs },
          { headers: { Authorization: token } }
        )
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [prefs, token]);

  const updatePref = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const applyThemeMode = (mode) => {
    localStorage.setItem('focusync_theme_mode', mode);
    if (mode === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const currentDark = localStorage.getItem('focusync_darkmode') === 'true';
      if (prefersDark !== currentDark) toggleDarkMode();
      setThemeMode('system');
      return;
    }

    const shouldDark = mode === 'dark';
    const currentDark = localStorage.getItem('focusync_darkmode') === 'true';
    if (shouldDark !== currentDark) toggleDarkMode();
    setThemeMode(mode);
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    setAccountMsg(null);
    try {
      const res = await axios.put(
        `${API_BASE}/auth/profile`,
        { username: profile.username, email: profile.email },
        { headers: { Authorization: token } }
      );
      const username = res.data?.user?.username || profile.username;
      localStorage.setItem('username', username);
      setProfile((prev) => ({ ...prev, username }));
      setAccountMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setAccountMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSavingAccount(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingSecurity(true);
    setSecurityMsg(null);
    if (passwords.newPassword.length < 8) {
      setSavingSecurity(false);
      setSecurityMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSavingSecurity(false);
      setSecurityMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }
    try {
      await axios.put(
        `${API_BASE}/auth/password`,
        passwords,
        { headers: { Authorization: token } }
      );
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSecurityMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setSecurityMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update password.' });
    } finally {
      setSavingSecurity(false);
    }
  };

  const exportData = async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: profile,
      preferences: prefs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focusync-user-data.json';
    a.click();
    URL.revokeObjectURL(url);
    setPrivacyMsg({ type: 'success', text: 'Data exported successfully.' });
  };

  const clearHistory = async () => {
    setClearingHistory(true);
    setPrivacyMsg(null);
    try {
      await axios.delete(`${API_BASE}/focus/history`, { headers: { Authorization: token } });
      setPrivacyMsg({ type: 'success', text: 'Productivity history cleared.' });
    } catch (err) {
      setPrivacyMsg({ type: 'error', text: err.response?.data?.error || 'Failed to clear history.' });
    } finally {
      setClearingHistory(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_BASE}/auth/account`, { headers: { Authorization: token } });
      resetToDefaultTheme();
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/';
    } catch (err) {
      setPrivacyMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete account.' });
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.primary }}>Settings</h1>
        <p className="text-sm mb-6" style={{ opacity: 0.8 }}>Manage your account, focus defaults, privacy, and notifications.</p>

        <div className="flex flex-col lg:flex-row gap-6">
          <SettingsSidebar sections={sections} activeSection={activeSection} onChange={setActiveSection} theme={currentTheme} />
          <main className="flex-1 space-y-6">
            {(activeSection === 'account') && (
              <AccountSettings
                theme={currentTheme}
                form={profile}
                onChange={(k, v) => setProfile((prev) => ({ ...prev, [k]: v }))}
                onSubmit={saveAccount}
                saving={savingAccount}
                message={accountMsg}
              />
            )}

            {(activeSection === 'security') && (
              <SecuritySettings
                theme={currentTheme}
                form={passwords}
                onChange={(k, v) => setPasswords((prev) => ({ ...prev, [k]: v }))}
                onSubmit={savePassword}
                saving={savingSecurity}
                message={securityMsg}
              />
            )}

            {(activeSection === 'focus') && (
              <FocusSettings theme={currentTheme} values={prefs} onChange={updatePref} />
            )}

            {(activeSection === 'productivity') && (
              <ProductivitySettings theme={currentTheme} values={prefs} onChange={updatePref} />
            )}

            {(activeSection === 'theme') && (
              <ThemeSettings theme={currentTheme} mode={themeMode} onModeChange={applyThemeMode} />
            )}

            {(activeSection === 'notifications') && (
              <NotificationSettings theme={currentTheme} values={prefs} onChange={updatePref} />
            )}

            {(activeSection === 'privacy') && (
              <DangerZone
                theme={currentTheme}
                onExportData={exportData}
                onClearHistory={clearHistory}
                onDeleteAccount={deleteAccount}
                message={privacyMsg}
                busy={clearingHistory}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
