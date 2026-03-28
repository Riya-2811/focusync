const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../data/tasks.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize empty tasks file if it doesn't exist
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks: [] }, null, 2));
}

const readTasks = () => {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data).tasks || [];
  } catch (err) {
    console.error('Error reading tasks:', err);
    return [];
  }
};

const writeTasks = (tasks) => {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks }, null, 2));
  } catch (err) {
    console.error('Error writing tasks:', err);
  }
};

const tasksDB = {
  // Get all tasks for a user
  getTasksByUserId: (userId) => {
    const tasks = readTasks();
    return tasks.filter(t => t.userId === userId);
  },

  // Get a single task by ID
  getTaskById: (id) => {
    const tasks = readTasks();
    return tasks.find(t => t.id === id);
  },

  // Create a new task (subtasks: array of { id, title, completed })
  createTask: (userId, title, description, priority, dueDate, subtasks = []) => {
    const tasks = readTasks();
    const subs = Array.isArray(subtasks) ? subtasks : [];

    const newTask = {
      id: Date.now().toString(),
      userId,
      title,
      description,
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      completed: false,
      subtasks: subs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    writeTasks(tasks);
    return newTask;
  },

  // Update a task
  updateTask: (id, updates) => {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    writeTasks(tasks);
    return tasks[taskIndex];
  },

  // Delete a task
  deleteTask: (id) => {
    const tasks = readTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    writeTasks(filteredTasks);
    return true;
  },

  // Toggle task completed status
  toggleTask: (id) => {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return null;
    }

    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    writeTasks(tasks);
    return task;
  },

  // Get all tasks (for debugging)
  getAllTasks: () => {
    return readTasks();
  },

  // Clear all tasks (for debugging)
  clearAllTasks: () => {
    writeTasks([]);
  }
};

module.exports = tasksDB;
