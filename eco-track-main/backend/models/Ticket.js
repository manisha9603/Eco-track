const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String },
  roomNumber: { type: String },
  description: { type: String, required: true },
  image: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'reopened'], default: 'pending' },
  
  // Resolution tracking
  resolvedBy: { type: String },
  resolvedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  proofImage: { type: String },
  isVerifiedByUser: { type: Boolean, default: false },
  isVerifiedByAdmin: { type: Boolean, default: false },

  remarks: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedByName: { type: String },
    addedAt: { type: Date, default: Date.now },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', TicketSchema);
