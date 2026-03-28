import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/api';
import { suggestSubtasks } from '../utils/taskSuggestions';

const TaskModal = ({ isOpen, onClose, task, onSave, theme }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    subtasks: [],
  });
  const [suggestedList, setSuggestedList] = useState([]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        subtasks: [],
      });
      setSuggestedList([]);
    }
  }, [task, isOpen]);

  const handleSuggestSubtasks = useCallback(() => {
    const list = suggestSubtasks(formData.title);
    setSuggestedList(list);
  }, [formData.title]);

  const addSubtask = (title) => {
    const id = `st-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setFormData((prev) => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), { id, title: title.trim(), completed: false }],
    }));
  };

  const addSuggestionAsSubtask = (suggestion, index) => {
    addSubtask(suggestion);
    setSuggestedList((prev) => prev.filter((_, i) => i !== index));
  };

  const addAllSuggestions = () => {
    suggestedList.forEach((s) => addSubtask(s));
    setSuggestedList([]);
  };

  const updateSubtask = (subId, newTitle) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: (prev.subtasks || []).map((s) =>
        s.id === subId ? { ...s, title: newTitle } : s
      ),
    }));
  };

  const removeSubtask = (subId) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter((s) => s.id !== subId),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Task title is required');
      return;
    }
    onSave({
      ...formData,
      subtasks: formData.subtasks || [],
    });
    setFormData({ title: '', description: '', priority: 'Medium', dueDate: '', subtasks: [] });
    setSuggestedList([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="rounded-2xl shadow-xl max-w-md w-full p-6 my-8"
        style={{ backgroundColor: theme.background, border: `2px solid ${theme.border}` }}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.primary }}>
          {task ? 'Edit Task' : 'Add New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
              Task Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="flex-1 p-3 rounded-lg border-2 focus:outline-none"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.text,
                }}
                placeholder="Enter task title"
                required
              />
              {formData.title.trim().length >= 15 && (
                <button
                  type="button"
                  onClick={handleSuggestSubtasks}
                  className="shrink-0 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: `${theme.primary}25`,
                    color: theme.primary,
                    border: `1px solid ${theme.primary}`,
                  }}
                >
                  Suggest subtasks
                </button>
              )}
            </div>
          </div>

          {suggestedList.length > 0 && (
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}
            >
              <p className="text-xs font-semibold" style={{ color: theme.primary }}>
                Suggested subtasks (add, edit, or ignore)
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedList.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm"
                    style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}` }}
                  >
                    <span style={{ color: theme.text }}>{s}</span>
                    <button
                      type="button"
                      onClick={() => addSuggestionAsSubtask(s, i)}
                      className="text-xs font-medium"
                      style={{ color: theme.primary }}
                    >
                      Add
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={addAllSuggestions}
                  className="text-xs font-medium px-2 py-1 rounded"
                  style={{ backgroundColor: theme.primary, color: '#fff' }}
                >
                  Add all
                </button>
              </div>
            </div>
          )}

          {(formData.subtasks || []).length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
                Subtasks
              </label>
              <ul className="space-y-2">
                {(formData.subtasks || []).map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s.title}
                      onChange={(e) => updateSubtask(s.id, e.target.value)}
                      className="flex-1 p-2 rounded border text-sm focus:outline-none"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                        color: theme.text,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeSubtask(s.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 rounded-lg border-2 focus:outline-none resize-none"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.background,
                color: theme.text,
              }}
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: theme.border, backgroundColor: theme.background, color: theme.text }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: theme.border, backgroundColor: theme.background, color: theme.text }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg font-semibold text-white transition-all"
              style={{ backgroundColor: theme.primary }}
            >
              {task ? 'Update Task' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: theme.border, color: theme.text }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskCard = ({ task, theme, onUpdate, onDelete, onToggle }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#ef4444'; // red
      case 'Medium':
        return '#f59e0b'; // amber
      case 'Low':
        return '#10b981'; // green
      default:
        return theme.primary;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <div
      className={`rounded-xl p-4 shadow-md transition-all duration-300 ${
        task.completed ? 'opacity-60' : ''
      }`}
      style={{
        backgroundColor: theme.background,
        border: `2px solid ${theme.border}`,
      }}
    >
      <div className="flex gap-3 items-start">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="mt-1 w-5 h-5 cursor-pointer"
          style={{ accentColor: theme.primary }}
        />

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`font-semibold text-lg ${task.completed ? 'line-through' : ''}`}
              style={{
                color: task.completed ? theme.text + '80' : theme.primary,
              }}
            >
              {task.title}
            </h3>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p
              className="text-sm mb-3"
              style={{
                color: task.completed ? theme.text + '60' : theme.text,
                opacity: task.completed ? 0.6 : 0.8,
              }}
            >
              {task.description}
            </p>
          )}

          {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
            <ul className="text-xs mb-3 space-y-1" style={{ color: theme.text, opacity: 0.85 }}>
              {task.subtasks.map((s) => (
                <li key={s.id || s.title} className="flex items-center gap-2">
                  <span className={s.completed ? 'line-through' : ''}>{s.title}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between gap-2">
            <span
              className="text-xs"
              style={{
                color: isOverdue ? '#ef4444' : theme.text,
                opacity: 0.9,
              }}
            >
              📅 {formatDate(task.dueDate)}
            </span>
            <span
              className="text-xs"
              style={{
                color: theme.text,
                opacity: 0.85,
              }}
            >
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: theme.border }}>
        <button
          onClick={() => onUpdate(task)}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            backgroundColor: theme.primary + '20',
            color: theme.primary,
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: '#ef4444' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const Tasks = () => {
  const { currentTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // All, Pending, Completed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch tasks on mount
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/tasks`, {
        headers: { Authorization: token },
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE}/tasks`, formData, {
        headers: { Authorization: token },
      });
      setTasks([...tasks, response.data]);
      setIsModalOpen(false);
      alert('Task added successfully!');
    } catch (err) {
      console.error('Error adding task:', err);
      alert('Failed to add task: ' + err.response?.data?.error);
    }
  };

  const handleUpdateTask = async (formData) => {
    try {
      const response = await axios.put(
        `${API_BASE}/tasks/${editingTask.id}`,
        formData,
        { headers: { Authorization: token } }
      );
      setTasks(tasks.map((t) => (t.id === editingTask.id ? response.data : t)));
      setEditingTask(null);
      setIsModalOpen(false);
      alert('Task updated successfully!');
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task: ' + err.response?.data?.error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${API_BASE}/tasks/${id}`, {
        headers: { Authorization: token },
      });
      setTasks(tasks.filter((t) => t.id !== id));
      alert('Task deleted successfully!');
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task: ' + err.response?.data?.error);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tasks/${id}/toggle`,
        {},
        { headers: { Authorization: token } }
      );
      setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Pending') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true; // All
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <div
      className="min-h-screen p-8 transition-all duration-300 ease-out"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.accent} 100%)`,
        transition: 'all 300ms ease',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: currentTheme.primary }}>
            📋 Task Manager
          </h1>
          <p style={{ color: currentTheme.text, opacity: 0.9 }}>
            Organize and track your tasks to stay focused
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', count: stats.total, icon: '📌' },
            { label: 'Pending', count: stats.pending, icon: '⏳' },
            { label: 'Completed', count: stats.completed, icon: '✅' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 text-center shadow-sm"
              style={{
                backgroundColor: currentTheme.background,
                border: `2px solid ${currentTheme.border}`,
              }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
                {stat.count}
              </div>
              <div className="text-sm" style={{ color: currentTheme.text, opacity: 0.9 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="mb-6 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: currentTheme.primary }}
        >
          ➕ Add New Task
        </button>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'Pending', 'Completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === f
                  ? 'text-white shadow-md scale-105'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={
                filter === f
                  ? {
                      backgroundColor: currentTheme.primary,
                    }
                  : {
                      backgroundColor: currentTheme.background,
                      color: currentTheme.text,
                      border: `2px solid ${currentTheme.border}`,
                    }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div
            className="text-center py-12"
            style={{ color: currentTheme.text, opacity: 0.9 }}
          >
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl"
            style={{
                      backgroundColor: currentTheme.background,
              border: `2px dashed ${currentTheme.border}`,
              color: currentTheme.text,
              opacity: 0.9,
            }}
          >
            <p className="text-lg mb-2">
              {filter === 'All' ? '📭 No tasks yet!' : `📭 No ${filter.toLowerCase()} tasks!`}
            </p>
            {filter === 'All' && (
              <p className="text-sm">
                Click "Add New Task" to get started with your productivity!
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                theme={currentTheme}
                onUpdate={(task) => {
                  setEditingTask(task);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={editingTask ? handleUpdateTask : handleAddTask}
        theme={currentTheme}
      />
    </div>
  );
};

export default Tasks;
