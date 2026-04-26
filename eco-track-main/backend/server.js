require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://eco-track-lemon-nu.vercel.app',
    'https://eco-track-95xokeery-manishas-projects-52d66dad.vercel.app',
    /\.vercel\.app$/  // allows all vercel preview URLs
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecotrack';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedAdmin();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Seed default admin account

async function seedAdmin() {
  const User = require('./models/User');
  try {
    // Delete and recreate to ensure role is correctly set
    await User.deleteOne({ email: 'admin@ecotrack.com' });
    
    await User.create({
      name: 'Admin',
      email: 'admin@ecotrack.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'CSE',
      avatar: '🛡️',
    });
    console.log('🛡️ Admin reseeded: admin@ecotrack.com / Admin@123');
  } catch (err) {
    console.error('Admin seed error:', err);
  }
}

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));

// Legacy compat: simple login (keep for backward compat during migration)
app.post('/api/login', async (req, res) => {
  const User = require('./models/User');
  try {
    const { name, avatar } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    let user = await User.findOne({ name });
    if (!user) {
      user = await User.create({ 
        name, 
        email: `${name.toLowerCase().replace(/\s/g, '')}@legacy.ecotrack`,
        password: 'legacy_no_login',
        avatar: avatar || '🌿', 
        points: 0 
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EcoTrack Pro server running on port ${PORT}`);
});
