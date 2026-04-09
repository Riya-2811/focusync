const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize empty users file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

const readUsers = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data).users || [];
  } catch (err) {
    console.error('Error reading users:', err);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users }, null, 2));
  } catch (err) {
    console.error('Error writing users:', err);
  }
};

const mockDB = {
  // Find a user by email
  findByEmail: (email) => {
    const users = readUsers();
    return users.find(u => u.email === email);
  },

  // Find a user by username
  findByUsername: (username) => {
    const users = readUsers();
    return users.find(u => u.username === username);
  },

  // Find a user by ID
  findById: (id) => {
    const users = readUsers();
    return users.find(u => u.id === id);
  },

  // Create a new user
  createUser: async (username, email, password) => {
    try {
      const users = readUsers();
      
      // Check if user already exists
      if (users.find(u => u.email === email || u.username === username)) {
        return null;
      }

      console.log('[mockDB] Hashing password for:', email);
      const hashedPassword = await bcrypt.hash(password, 8); // Reduced from 10 to 8 for dev speed
      
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('[mockDB] Saving user to file...');
      users.push(newUser);
      writeUsers(users);
      console.log('[mockDB] User saved successfully');
      
      return newUser;
    } catch (err) {
      console.error('[mockDB] Error creating user:', err);
      throw err;
    }
  },

  // Verify password
  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Get all users (for debugging)
  getAllUsers: () => {
    return readUsers().map(u => ({
      ...u,
      password: '***hidden***'
    }));
  },

  // Clear all users (for debugging)
  clearAllUsers: () => {
    writeUsers([]);
  },

  deleteUserById: (userId) => {
    const users = readUsers();
    const filtered = users.filter(u => u.id !== userId);
    if (filtered.length === users.length) return null;
    writeUsers(filtered);
    return true;
  },

  getThemePreference: (userId) => {
    const user = readUsers().find(u => u.id === userId);
    return user && typeof user.themePrimary === 'string' ? user.themePrimary : null;
  },

  setThemePreference: (userId, themePrimary) => {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx < 0) return null;
    users[idx].themePrimary = themePrimary || null;
    users[idx].updatedAt = new Date().toISOString();
    writeUsers(users);
    return users[idx].themePrimary;
  },

  updateUserProfile: (userId, updates = {}) => {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx < 0) return { error: 'User not found' };

    const nextUsername = typeof updates.username === 'string' ? updates.username.trim() : users[idx].username;
    const nextEmail = typeof updates.email === 'string' ? updates.email.trim().toLowerCase() : users[idx].email;

    if (!nextUsername || nextUsername.length < 2) {
      return { error: 'Name must be at least 2 characters' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      return { error: 'Please provide a valid email address' };
    }

    const emailConflict = users.find(u => u.id !== userId && u.email.toLowerCase() === nextEmail);
    if (emailConflict) {
      return { error: 'Email already exists' };
    }
    const usernameConflict = users.find(u => u.id !== userId && u.username.toLowerCase() === nextUsername.toLowerCase());
    if (usernameConflict) {
      return { error: 'Username already exists' };
    }

    users[idx].username = nextUsername;
    users[idx].email = nextEmail;
    users[idx].updatedAt = new Date().toISOString();
    writeUsers(users);
    return {
      user: {
        id: users[idx].id,
        username: users[idx].username,
        email: users[idx].email,
        createdAt: users[idx].createdAt,
        themePrimary: users[idx].themePrimary || null,
      }
    };
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx < 0) return { error: 'User not found' };
    if (!currentPassword || !newPassword) return { error: 'Current and new password are required' };
    if (newPassword.length < 8) return { error: 'New password must be at least 8 characters' };

    const ok = await bcrypt.compare(currentPassword, users[idx].password);
    if (!ok) return { error: 'Current password is incorrect' };

    users[idx].password = await bcrypt.hash(newPassword, 8);
    users[idx].updatedAt = new Date().toISOString();
    writeUsers(users);
    return { success: true };
  },

  getUserSettings: (userId) => {
    const user = readUsers().find(u => u.id === userId);
    return user?.settings && typeof user.settings === 'object' ? user.settings : {};
  },

  setUserSettings: (userId, settings) => {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx < 0) return null;
    const safeSettings = settings && typeof settings === 'object' ? settings : {};
    users[idx].settings = safeSettings;
    users[idx].updatedAt = new Date().toISOString();
    writeUsers(users);
    return users[idx].settings;
  },
};

module.exports = mockDB;
