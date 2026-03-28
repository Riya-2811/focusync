import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/api';
import PasswordField from '../components/PasswordField';

const Login = () => {
  const { currentTheme, isOnboarded } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const token = res.data?.token;
      const username = res.data?.user?.username;
      if (!token) {
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      if (username) localStorage.setItem('username', username);
      setLoading(false);
      const target = isOnboarded ? '/dashboard' : '/onboarding';
      window.location.href = target;
    } catch (err) {
      setLoading(false);
      const backendError = err.response?.data?.error || err.response?.data?.message;
      const isConnectionError = err.code === 'ERR_NETWORK' || !err.response || [502, 503, 504].includes(err.response?.status);
      if (backendError) {
        setError(backendError);
      } else if (isConnectionError) {
        setError('Cannot connect to server. Make sure the backend is running (cd backend && npm start).');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen transition-all duration-300 ease-out"
      style={{
        background: `linear-gradient(135deg, rgb(255, 255, 255) 0%, ${currentTheme.background} 100%)`,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-lg shadow-lg w-96"
        style={{
          backgroundColor: currentTheme.background,
          border: `2px solid ${currentTheme.border}`,
        }}
      >
        <h2 className="text-2xl mb-6 text-center font-semibold" style={{ color: currentTheme.primary }}>
          Login to FOCUSYNC
        </h2>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm text-white"
            style={{ backgroundColor: '#ef4444' }}
          >
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-lg border-2 transition-colors focus:outline-none placeholder:opacity-60"
            style={{
              backgroundColor: currentTheme.accent,
              borderColor: error ? '#ef4444' : currentTheme.border,
              color: currentTheme.text,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = currentTheme.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#ef4444' : currentTheme.border;
            }}
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            iconColor={currentTheme.text}
            autoComplete="current-password"
            style={{
              backgroundColor: currentTheme.accent,
              borderColor: error ? '#ef4444' : currentTheme.border,
              color: currentTheme.text,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = currentTheme.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#ef4444' : currentTheme.border;
            }}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: currentTheme.primary }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-4 text-center text-sm" style={{ color: currentTheme.text }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: currentTheme.primary }} className="font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;