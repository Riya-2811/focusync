const fs = require('fs');
const path = require('path');

const UPDATES_FILE = path.join(__dirname, '../data/updatePreferences.json');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(UPDATES_FILE)) {
  fs.writeFileSync(UPDATES_FILE, JSON.stringify({ preferences: [], seenLog: [] }, null, 2));
}

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(UPDATES_FILE, 'utf8'));
  } catch (err) {
    return { preferences: [], seenLog: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync(UPDATES_FILE, JSON.stringify(data, null, 2));
};

const updatesDB = {
  getPreferences: (userId) => {
    const { preferences } = readData();
    return preferences.filter((p) => p.userId === userId);
  },

  savePreference: (userId, articleId, preference, goal, source = 'curated') => {
    const data = readData();
    const idx = data.preferences.findIndex(
      (p) => p.userId === userId && p.articleId === articleId
    );
    const record = {
      userId,
      articleId,
      preference,
      goal: goal || 'default',
      source,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) data.preferences[idx] = record;
    else data.preferences.push(record);
    writeData(data);
    return record;
  },

  logSeen: (userId, articleId) => {
    const data = readData();
    const exists = data.seenLog.some((s) => s.userId === userId && s.articleId === articleId);
    if (!exists) {
      data.seenLog.push({ userId, articleId, seenAt: new Date().toISOString() });
      writeData(data);
    }
  },

  getNotInterestedIds: (userId) => {
    const { preferences } = readData();
    return preferences
      .filter((p) => p.userId === userId && p.preference === 'not_interested')
      .map((p) => p.articleId);
  },

  clearByUserId: (userId) => {
    const data = readData();
    data.preferences = data.preferences.filter((p) => p.userId !== userId);
    data.seenLog = data.seenLog.filter((s) => s.userId !== userId);
    writeData(data);
    return true;
  },
};

module.exports = updatesDB;
