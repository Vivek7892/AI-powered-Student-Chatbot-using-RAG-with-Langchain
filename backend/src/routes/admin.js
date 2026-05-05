const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cloudinary, upload, uploadToCloudinary } = require('../config/cloudinary');
const path = require('path');
const Admin = require('../models/Admin');
const AdminNote = require('../models/AdminNote');
const Timetable = require('../models/Timetable');
const ImportantNote = require('../models/ImportantNote');
const MCQTest = require('../models/MCQTest');
const User = require('../models/User');

const router = express.Router();

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ error: 'Invalid token' });
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload notes
router.post('/notes', adminAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, content, semester } = req.body;
    let fileName, filePath;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      fileName = req.file.originalname;
      filePath = result.secure_url;
    }
    const note = new AdminNote({ title, content, semester, fileName, filePath, uploadedBy: req.admin._id });
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload timetable
router.post('/timetable', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, semester } = req.body;
    let imagePath;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      imagePath = result.secure_url;
    }
    const timetable = new Timetable({ title, description, semester, imagePath, createdBy: req.admin._id });
    await timetable.save();
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create custom timetable
router.post('/timetable/create', adminAuth, async (req, res) => {
  try {
    const { title, description, semester, schedule } = req.body;
    const timetable = new Timetable({
      title,
      description,
      semester,
      schedule,
      createdBy: req.admin._id
    });
    await timetable.save();
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send important note
router.post('/important-notes', adminAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, message, semester, priority } = req.body;
    let fileName, filePath;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      fileName = req.file.originalname;
      filePath = result.secure_url;
    }
    const note = new ImportantNote({ title, message, semester, priority, fileName, filePath, createdBy: req.admin._id });
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create MCQ test
router.post('/mcq-tests', adminAuth, async (req, res) => {
  try {
    const { title, description, semester, questions, timeLimit } = req.body;
    console.log('Received MCQ data:', { title, description, semester, questions, timeLimit });
    
    if (!title || !description || !semester) {
      return res.status(400).json({ error: 'Title, description, and semester are required' });
    }
    
    const test = new MCQTest({
      title,
      description,
      semester,
      questions,
      timeLimit: parseInt(timeLimit) || 30,
      createdBy: req.admin._id
    });
    await test.save();
    console.log('Saved MCQ test:', test);
    res.json(test);
  } catch (error) {
    console.error('MCQ creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [userCount, notesCount, mcqCount, importantNotesCount] = await Promise.all([
      User.countDocuments(),
      AdminNote.countDocuments(),
      MCQTest.countDocuments(),
      ImportantNote.countDocuments()
    ]);
    
    res.json({
      activeStudents: userCount,
      totalNotes: notesCount,
      mcqTests: mcqCount,
      notifications: importantNotesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all data for students
router.get('/notes', async (req, res) => {
  try {
    const notes = await AdminNote.find().populate('uploadedBy', 'name');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get semester-specific content for students
router.get('/semester/:semester', async (req, res) => {
  try {
    const { semester } = req.params;
    const [notes, timetables, importantNotes, mcqTests] = await Promise.all([
      AdminNote.find({ semester }).populate('uploadedBy', 'name').sort({ createdAt: -1 }),
      Timetable.find({ semester }).populate('createdBy', 'name').sort({ createdAt: -1 }),
      ImportantNote.find({ semester }).populate('createdBy', 'name').sort({ createdAt: -1 }),
      MCQTest.find({ semester }).sort({ createdAt: -1 })
    ]);
    res.json({ notes, timetables, importantNotes, mcqTests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/timetables', async (req, res) => {
  try {
    const timetables = await Timetable.find().populate('createdBy', 'name');
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/important-notes', async (req, res) => {
  try {
    const notes = await ImportantNote.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mcq-tests', async (req, res) => {
  try {
    const tests = await MCQTest.find();
    res.json(tests);
  } catch (error) {
    console.error('MCQ fetch error:', error);
    res.json([]);
  }
});

// Update routes
router.put('/notes/:id', adminAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, content, semester } = req.body;
    const updateData = { title, content, semester };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      updateData.fileName = req.file.originalname;
      updateData.filePath = result.secure_url;
    }
    const note = await AdminNote.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/timetable/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, semester } = req.body;
    const updateData = { title, description, semester };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      updateData.imagePath = result.secure_url;
    }
    const timetable = await Timetable.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/important-notes/:id', adminAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, message, semester, priority } = req.body;
    const updateData = { title, message, semester, priority };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      updateData.fileName = req.file.originalname;
      updateData.filePath = result.secure_url;
    }
    const note = await ImportantNote.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/mcq-tests/:id', adminAuth, async (req, res) => {
  try {
    const { title, description, semester, questions, timeLimit } = req.body;
    
    const updateData = {
      title,
      description,
      semester,
      questions,
      timeLimit: parseInt(timeLimit) || 30
    };
    
    const test = await MCQTest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download/redirect to file — files are on Cloudinary, redirect to URL
router.get('/download/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let fileUrl;

    if (type === 'note') {
      const note = await AdminNote.findById(id);
      fileUrl = note?.filePath;
    } else if (type === 'important') {
      const note = await ImportantNote.findById(id);
      fileUrl = note?.filePath;
    } else if (type === 'timetable') {
      const timetable = await Timetable.findById(id);
      fileUrl = timetable?.imagePath;
    }

    if (!fileUrl) return res.status(404).json({ error: 'File not found' });

    // If it's a Cloudinary URL, redirect; otherwise 404
    if (fileUrl.startsWith('http')) {
      return res.redirect(fileUrl);
    }
    return res.status(404).json({ error: 'File not available' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete routes
router.delete('/notes/:id', adminAuth, async (req, res) => {
  try {
    await AdminNote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/timetable/:id', adminAuth, async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Timetable deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/important-notes/:id', adminAuth, async (req, res) => {
  try {
    await ImportantNote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Important note deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/mcq-tests/:id', adminAuth, async (req, res) => {
  try {
    await MCQTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'MCQ test deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;