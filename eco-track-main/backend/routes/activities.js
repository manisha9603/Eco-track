const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// We don't have a separate Activity model for now since local storage handles
// the activity log, but we sync points/co2 to the server for leaderboard purposes.

// POST /api/activities/sync — sync points after logging an activity
router.post('/sync', verifyToken, async (req, res) => {
  try {
    const { pointsEarned, co2Saved, activityName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { points: pointsEarned, totalCO2: co2Saved, activitiesCount: 1 },
        $set: { lastActivity: new Date() },
      },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Activity sync error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/activities/badges — claim a badge
router.post('/badges', verifyToken, async (req, res) => {
  try {
    const { badgeId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.badges.includes(badgeId)) {
      user.badges.push(badgeId);
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
