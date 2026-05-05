const express = require('express');
const AdminNote = require('../models/AdminNote');
const Timetable = require('../models/Timetable');
const ImportantNote = require('../models/ImportantNote');
const MCQTest = require('../models/MCQTest');
const auth = require('../middleware/auth');

const router = express.Router();

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
