import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/api';

const Signup = () => {
  const { currentTheme, resetToDefaultTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, { username, email, password });
      const token = res.data?.token;
      const usernameFromRes = res.data?.user?.username;
      if (!token) {
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      if (usernameFromRes) localStorage.setItem('username', usernameFromRes);
      resetToDefaultTheme();
      setLoading(false);
      window.location.href = '/onboarding';
    } catch (err) {
      setLoading(false);
      const backendError = err.response?.data?.error || err.response?.data?.message;
      const isConnectionError = err.code === 'ERR_NETWORK' || !err.response || [502, 503, 504].includes(err.response?.status);
      if (backendError) {
        setError(backendError);
      } else if (isConnectionError) {
        setError('Cannot connect to server. Make sure the backend is running (cd backend && npm start).');
      } else {
        setError('Signup failed. Please try again.');
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
        className="p-8 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: currentTheme.background,
          border: `2px solid ${currentTheme.border}`,
        }}
      >
        <h2 className="text-2xl mb-6 text-center font-semibold" style={{ color: currentTheme.primary }}>
          Sign up for FOCUSYNC
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
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 rounded-lg border-2 transition-colors focus:outline-none placeholder:opacity-60"
            style={{
              backgroundColor: currentTheme.accent,
              borderColor: error && username.length < 3 ? '#ef4444' : currentTheme.border,
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
          {username && username.length < 3 && (
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
              Username must be at least 3 characters
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-lg border-2 transition-colors focus:outline-none placeholder:opacity-60"
            style={{
              backgroundColor: currentTheme.accent,
              borderColor: currentTheme.border,
              color: currentTheme.text,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = currentTheme.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = currentTheme.border;
            }}
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 rounded-lg border-2 transition-colors focus:outline-none placeholder:opacity-60"
            style={{
              backgroundColor: currentTheme.accent,
              borderColor: error && password.length < 6 ? '#ef4444' : currentTheme.border,
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
          {password && password.length < 6 && (
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
              Password must be at least 6 characters
            </p>
          )}
        </div>

        <div className="mb-6">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full p-3 rounded-lg border-2 transition-colors focus:outline-none placeholder:opacity-60"
            style={{
              backgroundColor: currentTheme.accent,
              borderColor: error && password !== confirmPassword ? '#ef4444' : currentTheme.border,
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
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
              Passwords do not match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: currentTheme.primary }}
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="mt-4 text-center text-sm" style={{ color: currentTheme.text }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: currentTheme.primary }} className="font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;