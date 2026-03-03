const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminNote = require('../models/AdminNote');
const Timetable = require('../models/Timetable');
const ImportantNote = require('../models/ImportantNote');
const MCQTest = require('../models/MCQTest');

const router = express.Router();

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get semester-specific content
router.get('/content', auth, async (req, res) => {
  try {
    const userSemester = req.user.semester;
    
    const [notes, timetables, importantNotes, mcqTests] = await Promise.all([
      AdminNote.find({ semester: userSemester }).populate('uploadedBy', 'name'),
      Timetable.find({ semester: userSemester }).populate('createdBy', 'name'),
      ImportantNote.find({ semester: userSemester }).populate('createdBy', 'name').sort({ createdAt: -1 }),
      MCQTest.find({ semester: userSemester })
    ]);
    
    res.json({
      notes,
      timetables,
      importantNotes,
      mcqTests,
      userSemester
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;