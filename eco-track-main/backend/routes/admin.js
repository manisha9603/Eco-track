const express = require('express');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Task = require('../models/Task');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'pending' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const totalTasks = await Task.countDocuments();
    
    const co2Agg = await User.aggregate([{ $group: { _id: null, total: { $sum: '$totalCO2' } } }]);
    const totalCO2 = co2Agg.length > 0 ? co2Agg[0].total : 0;

    res.json({ totalUsers, totalTickets, openTickets, resolvedTickets, totalTasks, totalCO2 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// POST /api/admin/create
router.post('/create', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, department, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      department: department || 'IT',
      avatar: avatar || '🛡️'
    });

    res.status(201).json({ message: 'Admin created successfully', user: admin });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ error: 'Server error during admin creation.' });
  }
});

// PUT /api/admin/reset-password/:id
router.put('/reset-password/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = newPassword;
    await user.save(); // triggers bcrypt hash

    res.json({ message: 'User password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error while resetting password' });
  }
});

module.exports = router;
