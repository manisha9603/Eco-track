const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  department: { type: String, default: 'CSE' },
  avatar: { type: String, default: '🌱' },
  points: { type: Number, default: 0 },
  totalCO2: { type: Number, default: 0 },
  activitiesCount: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActivity: { type: Date },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
