import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const FeatureCard = ({ icon, title, description, link, theme }) => {
  return (
    <Link
      to={link}
      className="rounded-2xl p-6 shadow-sm transition duration-300 hover:shadow-lg hover:scale-105 cursor-pointer block"
      style={{
        backgroundColor: theme.background,
        border: `2px solid ${theme.border}`,
      }}
    >
      <div
        className="mb-4 h-12 w-12 flex items-center justify-center rounded-lg text-2xl"
        style={{
          backgroundColor: `${theme.primary}20`,
        }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ color: theme.primary }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: theme.text, opacity: 0.8 }}>
        {description}
      </p>
      <div
        className="mt-4 inline-block px-3 py-1 rounded-lg text-xs font-semibold"
        style={{
          backgroundColor: theme.primary,
          color: 'white',
        }}
      >
        Open →
      </div>
    </Link>
  );
};

const FeatureCards = () => {
  const { currentTheme } = useTheme();

  const features = [
    {
      icon: '📋',
      title: 'Daily Planner',
      description: 'Generate a Pomodoro schedule for the day and start focus sessions from the plan.',
      link: '/planner',
    },
    {
      icon: '⏱️',
      title: 'Focus Timer',
      description: 'Start a Pomodoro session to maintain deep focus and track your productivity.',
      link: '/focus',
    },
    {
      icon: '✅',
      title: 'Task Manager',
      description: 'Organize your tasks with priorities, tags, and due dates to stay on track.',
      link: '/tasks',
    },
    {
      icon: '📰',
      title: 'Current Affairs',
      description: 'Stay updated with news and articles related to your goals. Mark what interests you.',
      link: '/updates',
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Track your focus hours, completed tasks, and productivity trends over time.',
      link: '/analytics',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          link={feature.link}
          theme={currentTheme}
        />
      ))}
    </div>
  );
};

export default FeatureCards;
