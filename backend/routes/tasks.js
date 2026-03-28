const express = require('express');
const tasksDB = require('../db/tasksDB');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for logged-in user
router.get('/', auth, (req, res) => {
  try {
    console.log('[TASKS] Getting tasks for user:', req.userId);
    const tasks = tasksDB.getTasksByUserId(req.userId);
    res.json(tasks);
  } catch (err) {
    console.error('[TASKS] Error getting tasks:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get a single task
router.get('/:id', auth, (req, res) => {
  try {
    const task = tasksDB.getTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify ownership
    if (task.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create a new task
router.post('/', auth, (req, res) => {
  try {
    const { title, description, priority, dueDate, subtasks } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    console.log('[TASKS] Creating task for user:', req.userId);
    const task = tasksDB.createTask(req.userId, title, description, priority, dueDate, subtasks);
    
    res.status(201).json(task);
  } catch (err) {
    console.error('[TASKS] Error creating task:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update a task
router.put('/:id', auth, (req, res) => {
  try {
    const task = tasksDB.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify ownership
    if (task.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, priority, dueDate, completed, subtasks } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
    if (completed !== undefined) updates.completed = completed;
    if (subtasks !== undefined) updates.subtasks = Array.isArray(subtasks) ? subtasks : [];

    console.log('[TASKS] Updating task:', req.params.id);
    const updatedTask = tasksDB.updateTask(req.params.id, updates);

    res.json(updatedTask);
  } catch (err) {
    console.error('[TASKS] Error updating task:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a task
router.delete('/:id', auth, (req, res) => {
  try {
    const task = tasksDB.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify ownership
    if (task.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('[TASKS] Deleting task:', req.params.id);
    tasksDB.deleteTask(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('[TASKS] Error deleting task:', err);
    res.status(400).json({ error: err.message });
  }
});

// Toggle task completion
router.patch('/:id/toggle', auth, (req, res) => {
  try {
    const task = tasksDB.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify ownership
    if (task.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('[TASKS] Toggling task:', req.params.id);
    const toggledTask = tasksDB.toggleTask(req.params.id);

    res.json(toggledTask);
  } catch (err) {
    console.error('[TASKS] Error toggling task:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
