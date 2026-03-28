import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LOGO_SRC = `${process.env.PUBLIC_URL || ''}/logo.jpeg`;

const features = [
  {
    icon: '⏱️',
    title: 'Focus Timer with Deep Focus Mode',
    description: 'Pomodoro-style sessions with optional fullscreen mode, distraction tracking, and tab awareness to keep you in the zone.',
  },
  {
    icon: '📋',
    title: 'Daily Focus Planner',
    description: 'Generate a 25/5 minute schedule for the day. Start any focus block directly from the planner.',
  },
  {
    icon: '✅',
    title: 'Smart Task Breakdown',
    description: 'Add tasks and get suggested subtasks based on your title. Break big goals into manageable steps.',
  },
  {
    icon: '📊',
    title: 'Analytics and Focus Insights',
    description: 'Track focus time, streaks, and session history. Get Focus Coach insights tailored to your patterns.',
  },
];

const previews = [
  { title: 'Dashboard', subtitle: 'Overview, goals, streak calendar & heatmap', path: '/dashboard' },
  { title: 'Focus Timer', subtitle: 'Techniques, deep focus, quick notes', path: '/focus' },
  { title: 'Analytics', subtitle: 'Charts, insights, session history', path: '/analytics' },
];

const LandingPage = () => {
  const { currentTheme } = useTheme();

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        background: `linear-gradient(180deg, ${currentTheme.background} 0%, ${currentTheme.accent} 30%, ${currentTheme.background} 100%)`,
        color: currentTheme.text,
      }}
    >
      {/* Hero */}
      <section className="relative px-4 pt-16 pb-24 sm:pt-24 sm:pb-32 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${currentTheme.primary}18 0%, transparent 50%)`,
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <img
              src={LOGO_SRC}
              alt=""
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-2xl"
              style={{ border: `2px solid ${currentTheme.border}` }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
            style={{ color: currentTheme.primary }}
          >
            FOCUSYNC
          </h1>
          <p
            className="text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: currentTheme.text, opacity: 0.95 }}
          >
            Goal-based focus and productivity system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold text-white transition-all hover:opacity-95"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold transition-all"
              style={{
                backgroundColor: 'transparent',
                color: currentTheme.primary,
                border: `2px solid ${currentTheme.primary}`,
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:py-20 max-w-6xl mx-auto">
        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-12"
          style={{ color: currentTheme.primary }}
        >
          What you get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 text-left transition-all"
              style={{
                backgroundColor: currentTheme.background,
                border: `2px solid ${currentTheme.border}`,
                boxShadow: `0 4px 14px ${currentTheme.primary}10`,
              }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-4"
                style={{ backgroundColor: `${currentTheme.primary}20`, color: currentTheme.primary }}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.primary }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: currentTheme.text, opacity: 0.9 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview / Screenshots */}
      <section className="px-4 py-16 sm:py-20 max-w-6xl mx-auto">
        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-12"
          style={{ color: currentTheme.primary }}
        >
          Inside the app
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {previews.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 text-center transition-all"
              style={{
                backgroundColor: currentTheme.accent,
                border: `2px solid ${currentTheme.border}`,
              }}
            >
              <div
                className="rounded-xl h-32 flex items-center justify-center text-4xl mb-4"
                style={{
                  backgroundColor: `${currentTheme.primary}15`,
                  border: `1px dashed ${currentTheme.primary}40`,
                }}
              >
                {p.title === 'Dashboard' && '📊'}
                {p.title === 'Focus Timer' && '⏱️'}
                {p.title === 'Analytics' && '📈'}
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: currentTheme.primary }}>
                {p.title}
              </h3>
              <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.85 }}>
                {p.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:py-24 text-center">
        <div
          className="max-w-2xl mx-auto rounded-2xl p-10 sm:p-12"
          style={{
            backgroundColor: currentTheme.accent,
            border: `2px solid ${currentTheme.border}`,
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: currentTheme.primary }}>
            Start focusing smarter today
          </h2>
          <p className="text-base mb-8" style={{ color: currentTheme.text, opacity: 0.9 }}>
            Create your account and choose a focus goal to get started.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-xl px-10 py-4 text-base font-semibold text-white transition-all hover:opacity-95"
            style={{ backgroundColor: currentTheme.primary }}
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 text-center text-sm"
        style={{ color: currentTheme.text, opacity: 0.7, borderTop: `1px solid ${currentTheme.border}` }}
      >
        FOCUSYNC · Goal-based focus and productivity
      </footer>
    </div>
  );
};

export default LandingPage;
