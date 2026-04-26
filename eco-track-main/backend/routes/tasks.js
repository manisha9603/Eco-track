const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/tasks
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).limit(50);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tasks
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, problem, solution, department } = req.body;

    const pointsAwarded = req.file ? 60 : 40; // bonus for image proof

    const task = await Task.create({
      title,
      problem,
      solution,
      department: department || req.user.department,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      pointsAwarded,
      submittedBy: req.user._id,
      userName: req.user.name,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { points: pointsAwarded } });

    res.status(201).json(task);
  } catch (error) {
    console.error('Task POST error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
