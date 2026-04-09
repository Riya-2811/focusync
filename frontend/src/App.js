import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import FocusTimer from './pages/FocusTimer';
import Planner from './pages/Planner';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Updates from './pages/Updates';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { currentTheme, isOnboarded } = useTheme();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div
      className="min-h-screen transition-all duration-300 ease-out"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.accent} 100%)`,
        color: currentTheme.text,
        transition: 'all 300ms ease',
      }}
    >
      {isLoggedIn && <NavBar />}
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} replace /> : <Signup />}
        />
        <Route
          path="/onboarding"
          element={isLoggedIn ? <Onboarding /> : <Navigate to="/" replace />}
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              isOnboarded ? <Dashboard /> : <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/focus"
          element={isLoggedIn ? (isOnboarded ? <FocusTimer /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/planner"
          element={isLoggedIn ? (isOnboarded ? <Planner /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/tasks"
          element={isLoggedIn ? (isOnboarded ? <Tasks /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/analytics"
          element={isLoggedIn ? (isOnboarded ? <Analytics /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/updates"
          element={isLoggedIn ? (isOnboarded ? <Updates /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/settings"
          element={isLoggedIn ? (isOnboarded ? <SettingsPage /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
