const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/tickets — all tickets (with optional status/dept filter)
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tickets/mine — current user's tickets
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tickets — create ticket
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, department, location, roomNumber, description, priority } = req.body;

    const ticket = await Ticket.create({
      title: title || 'Untitled Issue',
      department: department || req.user.department,
      location,
      roomNumber,
      description,
      priority: priority || 'medium',
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdBy: req.user._id,
      authorName: req.user.name,
    });

    // +5 bonus points for reporting
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Ticket POST error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tickets/:id — admin or user updates status, adds remarks, proof
router.put('/:id', verifyToken, upload.single('proofImage'), async (req, res) => {
  try {
    const { status, remark } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Status transition validation
    const validTransitions = {
      pending: ['in_progress', 'resolved'], // allow jumping straight to resolved if they fixed it
      in_progress: ['resolved'],
      resolved: [], // only user can reopen
      reopened: ['in_progress', 'resolved'],
    };

    if (status && status !== ticket.status) {
      const allowed = validTransitions[ticket.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: `Cannot transition from ${ticket.status} to ${status}` });
      }
      ticket.status = status;

      // If resolving, capture who resolved and when, and mandate photo
      if (status === 'resolved') {
        if (!req.file && !ticket.proofImage) {
           return res.status(400).json({ error: "Proof photo is absolutely necessary to resolve a ticket." });
        }
        ticket.resolvedBy = req.user.name;
        ticket.resolvedById = req.user._id;
        ticket.resolvedAt = new Date();
        ticket.isVerifiedByUser = false; 
        ticket.isVerifiedByAdmin = false;
      }
    }

    // Add remark
    if (remark) {
      ticket.remarks.push({
        text: remark,
        addedBy: req.user._id,
        addedByName: req.user.name,
        addedAt: new Date(),
      });
    }

    // Add proof image
    if (req.file) {
      ticket.proofImage = `/uploads/${req.file.filename}`;
    }

    await ticket.save();

    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error('Ticket PUT error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tickets/verify/:id — user confirms satisfaction
router.put('/verify/:id', verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Only the creator can verify
    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the ticket creator can verify resolution' });
    }

    if (ticket.status !== 'resolved') {
      return res.status(400).json({ error: 'Only resolved tickets can be verified' });
    }

    const { isVerifiedByUser } = req.body;

    if (isVerifiedByUser === true) {
      // Satisfied
      ticket.isVerifiedByUser = true;
      ticket.remarks.push({
        text: '✅ User confirmed: Issue is resolved and satisfactory.',
        addedBy: req.user._id,
        addedByName: req.user.name,
        addedAt: new Date(),
      });
      
      // Award 5 points to creator for confirming
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });
      
      // Award 50 points to the solver (if they are not the creator)
      if (ticket.resolvedById && ticket.resolvedById.toString() !== req.user._id.toString()) {
        await User.findByIdAndUpdate(ticket.resolvedById, { $inc: { points: 50 } });
      }
      
    } else {
      // Not fixed → reopen
      ticket.status = 'reopened';
      ticket.isVerifiedByUser = false;
      ticket.resolvedBy = null;
      ticket.resolvedAt = null;
      ticket.remarks.push({
        text: '❌ User reported: Issue is NOT fixed. Ticket reopened.',
        addedBy: req.user._id,
        addedByName: req.user.name,
        addedAt: new Date(),
      });
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    console.error('Ticket verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tickets/admin-verify/:id — admin verifies a ticket
router.put('/admin-verify/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { isVerifiedByAdmin } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (ticket.status !== 'resolved') {
      return res.status(400).json({ error: 'Only resolved tickets can be verified' });
    }

    if (isVerifiedByAdmin === true) {
      ticket.isVerifiedByAdmin = true;
      ticket.remarks.push({
        text: '🛡️ Admin Verified: This fix has been officially approved.',
        addedBy: req.user._id,
        addedByName: req.user.name,
        addedAt: new Date(),
      });

      // Award 50 points to the student who solved it
      if (ticket.resolvedById) {
        await User.findByIdAndUpdate(ticket.resolvedById, { $inc: { points: 50 } });
      }
    } else {
      // Reject
      ticket.status = 'reopened';
      ticket.isVerifiedByAdmin = false;
      ticket.isVerifiedByUser = false;
      ticket.resolvedBy = null;
      ticket.resolvedById = null;
      ticket.resolvedAt = null;
      ticket.remarks.push({
        text: '❌ Admin Rejected: The submitted proof/fix is rejected. Ticket reopened.',
        addedBy: req.user._id,
        addedByName: req.user.name,
        addedAt: new Date(),
      });
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    console.error('Admin verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
