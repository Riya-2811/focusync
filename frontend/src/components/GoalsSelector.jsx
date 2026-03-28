import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { themeConfig, goals } from '../utils/themeConfig';

const GoalsSelector = ({ selectedGoal, onSelectGoal }) => {
  const { isDarkMode } = useTheme();

  const handleSelectGoal = (goalKey) => {
    onSelectGoal(goalKey);
    localStorage.setItem('focusync_goal', goalKey);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
      {goals.map((goal) => {
        const palette = themeConfig[goal.key]?.[isDarkMode ? 'dark' : 'light'] || themeConfig.default.light;
        const isSelected = selectedGoal === goal.key;

        return (
          <button
            key={goal.key}
            onClick={() => handleSelectGoal(goal.key)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
              isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
            }`}
            style={{
              border: `2px solid ${palette.primary}`,
              backgroundColor: isSelected ? palette.primary : 'transparent',
              color: isSelected ? (isDarkMode ? palette.text : '#fff') : palette.primary,
              boxShadow: isSelected ? `0 0 16px ${palette.primary}33` : 'none',
            }}
            title={goal.name}
          >
            <span>{goal.emoji}</span>
            {goal.name}
          </button>
        );
      })}
    </div>
  );
};

export default GoalsSelector;
