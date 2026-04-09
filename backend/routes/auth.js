const express = require('express');
const jwt = require('jsonwebtoken');
const mockDB = require('../db/mockDB');
const auth = require('../middleware/auth');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    console.log('[SIGNUP] Attempting signup for:', email);
    
    // Validate input
    if (!username || !email || !password) {
      console.log('[SIGNUP] Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    if (mockDB.findByEmail(email)) {
      console.log('[SIGNUP] Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (mockDB.findByUsername(username)) {
      console.log('[SIGNUP] Username already exists:', username);
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create user
    console.log('[SIGNUP] Creating user...');
    const user = await mockDB.createUser(username, email, password);
    
    if (!user) {
      console.log('[SIGNUP] Failed to create user');
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev_secret_key');
    
    console.log('[SIGNUP] User created successfully:', email);
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('[SIGNUP] Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = mockDB.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await mockDB.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev_secret_key');
    
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  try {
    const user = mockDB.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      themePrimary: user.themePrimary || null,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update profile (name/email)
router.put('/profile', auth, (req, res) => {
  try {
    const { username, email } = req.body || {};
    const result = mockDB.updateUserProfile(req.userId, { username, email });
    if (result.error) return res.status(400).json({ error: result.error });
    res.json({ message: 'Profile updated successfully', user: result.user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }
    const result = await mockDB.changePassword(req.userId, currentPassword, newPassword);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user settings/preferences blob
router.get('/preferences', auth, (req, res) => {
  try {
    const preferences = mockDB.getUserSettings(req.userId);
    res.json({ preferences });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Save user settings/preferences blob
router.put('/preferences', auth, (req, res) => {
  try {
    const { preferences } = req.body || {};
    if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
      return res.status(400).json({ error: 'preferences must be an object' });
    }
    const saved = mockDB.setUserSettings(req.userId, preferences);
    if (!saved) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Preferences saved', preferences: saved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get theme preference (primary color hex) for current user
router.get('/theme', auth, (req, res) => {
  try {
    const themePrimary = mockDB.getThemePreference(req.userId);
    res.json({ themePrimary });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Set theme preference (primary color hex); pass null to use goal default
router.put('/theme', auth, (req, res) => {
  try {
    let { themePrimary } = req.body;
    if (themePrimary !== null && themePrimary !== undefined) {
      if (typeof themePrimary !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(themePrimary.trim())) {
        return res.status(400).json({ error: 'themePrimary must be a valid hex color (e.g. #6B9B8A)' });
      }
      themePrimary = themePrimary.trim();
    } else {
      themePrimary = null;
    }
    const updated = mockDB.setThemePreference(req.userId, themePrimary);
    res.json({ themePrimary: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete account
router.delete('/account', auth, (req, res) => {
  try {
    const deleted = mockDB.deleteUserById(req.userId);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Debug endpoint - get all users (remove in production)
router.get('/debug/all-users', (req, res) => {
  res.json(mockDB.getAllUsers());
});

module.exports = router;