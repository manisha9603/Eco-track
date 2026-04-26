const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problem: { type: String },
  solution: { type: String, required: true },
  department: { type: String },
  image: { type: String },
  pointsAwarded: { type: Number, default: 40 },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', TaskSchema);
