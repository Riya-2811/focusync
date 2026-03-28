/**
 * Keyword-based subtask suggestions for Smart Task Breakdown.
 * Returns suggested subtask titles for a given task title.
 */
const KEYWORD_MAP = {
  exam: ['Study syllabus', 'Revise notes', 'Practice MCQs', 'Take mock tests'],
  mca: ['Study syllabus', 'Revise notes', 'Practice MCQs', 'Take mock tests'],
  prepare: ['Research and plan', 'Gather materials', 'Create outline', 'Review'],
  project: ['Plan scope', 'Research', 'Draft outline', 'Review and refine'],
  assignment: ['Read requirements', 'Draft outline', 'Write first draft', 'Edit and submit'],
  presentation: ['Outline slides', 'Create content', 'Add visuals', 'Rehearse'],
  report: ['Gather data', 'Outline structure', 'Write sections', 'Edit and format'],
  study: ['Review materials', 'Take notes', 'Practice problems', 'Self-test'],
  learn: ['Set objectives', 'Find resources', 'Practice', 'Review'],
  workout: ['Warm up', 'Main sets', 'Cool down', 'Stretch'],
  exercise: ['Warm up', 'Main sets', 'Cool down', 'Stretch'],
  meeting: ['Prepare agenda', 'Gather notes', 'Join on time', 'Send follow-up'],
  interview: ['Research company', 'Prepare answers', 'Practice', 'Follow up'],
  application: ['Gather documents', 'Fill form', 'Review', 'Submit'],
  review: ['List items', 'Check each', 'Note gaps', 'Update'],
  default: ['Break down steps', 'Set milestones', 'Track progress', 'Review'],
};

export function suggestSubtasks(taskTitle) {
  if (!taskTitle || typeof taskTitle !== 'string') return [];
  const lower = taskTitle.toLowerCase().trim();
  for (const [keyword, suggestions] of Object.entries(KEYWORD_MAP)) {
    if (keyword !== 'default' && lower.includes(keyword)) return [...suggestions];
  }
  return [...KEYWORD_MAP.default];
}
