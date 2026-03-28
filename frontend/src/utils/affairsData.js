// Mock data for current affairs/news related to each goal
export const affairsData = {
  studies: [
    {
      id: 1,
      title: 'New AI-Powered Learning Platform Released',
      description: 'A breakthrough in personalized education with AI tutoring becoming more accessible to students worldwide.',
      category: 'Education',
      date: 'March 12, 2026',
    },
    {
      id: 2,
      title: 'Effective Study Techniques: The Pomodoro Method',
      description: 'Research confirms that 25-minute focused sessions improve retention and reduce burnout among students.',
      category: 'Learning',
      date: 'March 10, 2026',
    },
    {
      id: 3,
      title: 'University of Oxford Launches Free Online Courses',
      description: 'Thousands of courses now available for free, covering everything from mathematics to philosophy.',
      category: 'Education',
      date: 'March 9, 2026',
    },
  ],
  work: [
    {
      id: 1,
      title: 'Remote Work Productivity Hits Record High',
      description: 'Global survey shows remote workers are 13% more productive with proper time management tools.',
      category: 'Productivity',
      date: 'March 12, 2026',
    },
    {
      id: 2,
      title: 'Focus Time Rules: Setting Boundaries at Work',
      description: 'Tech companies report 40% increase in output when implementing "no meeting" time blocks.',
      category: 'Best Practices',
      date: 'March 11, 2026',
    },
    {
      id: 3,
      title: 'Deep Work: The Future of Professional Success',
      description: 'New study reveals that professionals who practice deep work earn 20% more than their peers.',
      category: 'Career',
      date: 'March 8, 2026',
    },
  ],
  wellness: [
    {
      id: 1,
      title: 'Mindfulness Meditation Reduces Stress by 35%',
      description: 'Clinical trials show daily meditation practice significantly improves mental health outcomes.',
      category: 'Mental Health',
      date: 'March 12, 2026',
    },
    {
      id: 2,
      title: 'The Power of Taking Breaks for Well-being',
      description: 'Regular breaks boost mood, reduce anxiety, and improve overall life satisfaction.',
      category: 'Wellness',
      date: 'March 10, 2026',
    },
    {
      id: 3,
      title: 'Sleep Quality: Your Hidden Productivity Weapon',
      description: 'Better sleep leads to better focus and emotional resilience during the workday.',
      category: 'Health',
      date: 'March 9, 2026',
    },
  ],
  fitness: [
    {
      id: 1,
      title: 'High-Intensity Interval Training: Efficient Workouts',
      description: '20-minute focused workout sessions deliver same benefits as hour-long traditional exercise.',
      category: 'Exercise',
      date: 'March 12, 2026',
    },
    {
      id: 2,
      title: 'Morning Exercise Improves Mental Clarity',
      description: 'Starting your day with physical activity increases focus and decision-making ability by 40%.',
      category: 'Performance',
      date: 'March 11, 2026',
    },
    {
      id: 3,
      title: 'Consistency Over Intensity in Fitness',
      description: 'Sustainable, regular exercise routines outperform sporadic intense training sessions.',
      category: 'Fitness',
      date: 'March 8, 2026',
    },
  ],
  creative: [
    {
      id: 1,
      title: 'Creative Flow State: Unlocking Your Potential',
      description: 'Uninterrupted focus enables creative breakthroughs - artists report 5x more output during deep work.',
      category: 'Creativity',
      date: 'March 12, 2026',
    },
    {
      id: 2,
      title: 'Digital Tools for Creative Professionals',
      description: 'New suite of AI-assisted design tools helps creators focus on vision while automating repetitive tasks.',
      category: 'Technology',
      date: 'March 10, 2026',
    },
    {
      id: 3,
      title: 'Breaking Creative Blocks: The Focus Method',
      description: 'Structured focus sessions with breaks help creatives overcome procrastination and perfectionism.',
      category: 'Inspiration',
      date: 'March 7, 2026',
    },
  ],
};

export const getAffairsForGoal = (goal) => {
  return affairsData[goal] || affairsData.studies;
};
