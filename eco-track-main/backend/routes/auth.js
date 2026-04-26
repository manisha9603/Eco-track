const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, role, avatar } = req.body;

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

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      department: department || 'CSE',
      role: 'student', // Security override: strictly enforce default role
      avatar: avatar || '🌱',
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

   const user = await User.findOne({ email: email.toLowerCase() }).select('+role +name +email +avatar +points');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/change-password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid old and new password (min 6 chars) are required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect old password.' });

    user.password = newPassword;
    await user.save(); // triggers pre-save hook for bcrypt

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
