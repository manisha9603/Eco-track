const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/leaderboard — top users
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('name avatar points totalCO2 department streak badges activitiesCount')
      .sort({ points: -1 })
      .limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/leaderboard/department
router.get('/department', async (req, res) => {
  try {
    const deptStats = await User.aggregate([
      { $group: {
        _id: '$department',
        avgPoints: { $avg: '$points' },
        totalCO2: { $sum: '$totalCO2' },
        memberCount: { $sum: 1 },
      }},
      { $sort: { avgPoints: -1 } }
    ]);
    res.json(deptStats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
