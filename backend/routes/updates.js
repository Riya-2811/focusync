const express = require('express');
const auth = require('../middleware/auth');
const updatesDB = require('../db/updatesDB');
const newsService = require('../services/newsService');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const goal = req.query.goal || 'default';
    const category = req.query.category;
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 30);
    const notInterestedIds = updatesDB.getNotInterestedIds(req.userId);
    let updates = await newsService.getUpdates(goal, notInterestedIds, limit);
    if (category) {
      updates = updates.filter((u) =>
        u.category?.toLowerCase().includes(category.toLowerCase())
      );
    }
    res.json({ updates, goal });
  } catch (err) {
    console.error('[UPDATES] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/preference', auth, (req, res) => {
  try {
    const { articleId, preference, goal } = req.body;
    if (!articleId || !preference) {
      return res.status(400).json({ error: 'articleId and preference required' });
    }
    if (!['interested', 'not_interested'].includes(preference)) {
      return res.status(400).json({ error: 'preference must be interested or not_interested' });
    }
    const record = updatesDB.savePreference(
      req.userId,
      articleId,
      preference,
      goal || 'default'
    );
    updatesDB.logSeen(req.userId, articleId);
    res.json({ success: true, preference: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
