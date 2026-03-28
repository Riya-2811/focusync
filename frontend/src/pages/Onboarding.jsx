import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { themeConfig, goals } from '../utils/themeConfig';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const GoalCard = ({ goal, palette, isSelected, onSelect, index }) => (
  <motion.button
    type="button"
    layout
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(goal.key)}
    className="flex flex-col items-center justify-center rounded-2xl p-6 min-h-[120px] w-full text-left transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    style={{
      backgroundColor: palette.accent,
      border: `2px solid ${isSelected ? palette.primary : palette.border}`,
      color: palette.text,
      boxShadow: isSelected ? `0 8px 24px ${palette.primary}40, 0 0 0 3px ${palette.primary}30` : '0 2px 8px rgba(0,0,0,0.06)',
      transform: isSelected ? 'scale(1.02)' : undefined,
    }}
    title={goal.name}
  >
    <motion.span
      className="flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-3"
      style={{
        backgroundColor: `${palette.primary}20`,
        color: palette.primary,
      }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {goal.emoji}
    </motion.span>
    <span className="font-semibold text-sm sm:text-base text-center leading-tight" style={{ color: palette.primary }}>
      {goal.name}
    </span>
  </motion.button>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const { completeOnboarding, currentTheme, isDarkMode, setSelectedGoal: setGlobalGoal } = useTheme();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const userName = localStorage.getItem('username') || 'there';

  const handleSelectGoal = (goalKey) => {
    setSelectedGoal(goalKey);
    setGlobalGoal(goalKey);
  };

  const handleContinue = () => {
    if (selectedGoal) {
      completeOnboarding(selectedGoal);
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 transition-all duration-300 ease-out"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.accent} 100%)`,
        color: currentTheme.text,
      }}
    >
      <div className="mx-auto max-w-4xl w-full">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2 transition-colors duration-300"
            style={{ color: currentTheme.primary }}
          >
            Welcome{userName !== 'there' ? `, ${userName}` : ''}!
          </h1>
          <p
            className="text-lg transition-colors duration-300"
            style={{ color: currentTheme.text, opacity: 0.9 }}
          >
            Select your main focus goal to personalize your FOCUSYNC experience.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {goals.map((goal, index) => {
            const palette = themeConfig[goal.key]?.[isDarkMode ? 'dark' : 'light'] || themeConfig.default.light;
            const isSelected = selectedGoal === goal.key;
            return (
              <GoalCard
                key={goal.key}
                goal={goal}
                palette={palette}
                isSelected={isSelected}
                onSelect={handleSelectGoal}
                index={index}
              />
            );
          })}
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.button
            type="button"
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="px-10 py-3 rounded-full font-semibold shadow-lg transition-all duration-300"
            style={{
              backgroundColor: currentTheme.primary,
              color: isDarkMode ? currentTheme.text : '#fff',
              opacity: selectedGoal ? 1 : 0.5,
              cursor: selectedGoal ? 'pointer' : 'not-allowed',
            }}
            whileHover={selectedGoal ? { scale: 1.03 } : {}}
            whileTap={selectedGoal ? { scale: 0.98 } : {}}
          >
            Continue to Dashboard
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
