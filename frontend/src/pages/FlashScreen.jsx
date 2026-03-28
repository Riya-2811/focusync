import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const TAGLINE = 'Master Your Focus. Eliminate Distractions.';
const TYPING_SPEED = 60;
const LOGO_SRC = `${process.env.PUBLIC_URL || ''}/logo.jpeg`;

const FlashScreen = () => {
  const { currentTheme } = useTheme();
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (displayedText.length >= TAGLINE.length) {
      setIsComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayedText(TAGLINE.slice(0, displayedText.length + 1));
    }, TYPING_SPEED);
    return () => clearTimeout(timer);
  }, [displayedText]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden transition-all duration-500 ease-out"
      style={{
        background: `linear-gradient(160deg, ${currentTheme.background} 0%, ${currentTheme.accent} 40%, ${currentTheme.background} 100%)`,
        color: currentTheme.text,
      }}
    >
      {/* Soft decorative background shapes */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        aria-hidden
      >
        <div
          className="absolute rounded-full w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] -top-1/2 -left-1/2 blur-3xl"
          style={{ background: `radial-gradient(circle, ${currentTheme.primary}15 0%, transparent 70%)` }}
        />
        <div
          className="absolute rounded-full w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] top-1/2 -right-1/4 blur-3xl"
          style={{ background: `radial-gradient(circle, ${currentTheme.primary}12 0%, transparent 70%)` }}
        />
        <div
          className="absolute rounded-full w-[40vw] h-[40vw] max-w-[280px] max-h-[280px] bottom-0 left-1/2 blur-3xl"
          style={{ background: `radial-gradient(circle, ${currentTheme.accent} 0%, transparent 70%)` }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo with curved frame and theme styling */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div
            className="relative flex items-center justify-center p-3 sm:p-4 rounded-3xl overflow-hidden"
            style={{
              backgroundColor: currentTheme.background,
              border: `2px solid ${currentTheme.border}`,
              boxShadow: `0 4px 20px ${currentTheme.primary}20, 0 0 0 1px ${currentTheme.primary}10`,
            }}
          >
            <img
              src={LOGO_SRC}
              alt="FOCUSYNC"
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-2xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span
              className="hidden text-4xl sm:text-5xl font-bold tracking-tight min-w-[3rem] min-h-[3rem] flex items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `${currentTheme.primary}20`,
                color: currentTheme.primary,
              }}
            >
              F
            </span>
          </div>
        </motion.div>

        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 transition-colors duration-300"
          style={{ color: currentTheme.primary }}
        >
          FOCUSYNC
        </h1>

        <p
          className="text-xl sm:text-2xl font-semibold leading-tight mb-2 min-h-[2.5em] flex items-center justify-center flex-wrap transition-colors duration-300"
          style={{ color: currentTheme.primary }}
        >
          {displayedText}
          {!isComplete && (
            <span
              className="inline-block w-0.5 h-[0.9em] ml-0.5 animate-pulse align-middle rounded-full"
              style={{ backgroundColor: currentTheme.primary }}
            />
          )}
        </p>

        <p
          className="text-base sm:text-lg mb-12 max-w-md mx-auto leading-relaxed transition-colors duration-300"
          style={{ color: currentTheme.text, opacity: 0.9 }}
        >
          Timed focus sessions, task tracking, and productivity insights—so you can start each day with a clear workflow.
        </p>

        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link to="/signup" className="inline-block">
            <motion.span
              className="inline-flex items-center justify-center rounded-full px-10 py-3.5 text-sm font-semibold text-white shadow-lg w-full sm:w-auto"
              style={{ backgroundColor: currentTheme.primary }}
              whileHover={{ scale: 1.03, boxShadow: `0 12px 28px ${currentTheme.primary}50` }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Get Started
            </motion.span>
          </Link>
          <Link to="/login" className="inline-block">
            <motion.span
              className="inline-flex items-center justify-center rounded-full px-10 py-3.5 text-sm font-semibold w-full sm:w-auto"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.primary,
                border: `2px solid ${currentTheme.primary}`,
              }}
              whileHover={{ scale: 1.03, backgroundColor: currentTheme.accent }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Login
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FlashScreen;
