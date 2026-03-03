const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/notes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, TXT, JPG, and PNG files are allowed'));
    }
  }
});

// Upload note
router.post('/upload', upload.single('note'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, name } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({ error: 'User ID and name are required' });
    }

    const note = new Note({
      userId,
      name: name.trim(),
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    await note.save();

    res.json({
      success: true,
      noteId: note._id,
      name: note.name,
      fileName: note.fileName,
      message: 'Note uploaded successfully'
    });
  } catch (error) {
    console.error('Note upload error:', error);
    res.status(500).json({ error: 'Failed to upload note' });
  }
});

// Get user notes
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    
    const notesWithMetadata = notes.map(note => ({
      id: note._id,
      name: note.name,
      fileName: note.fileName,
      size: note.fileSize,
      uploadDate: note.createdAt,
      mimeType: note.mimeType
    }));

    res.json(notesWithMetadata);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Delete note
router.delete('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(note.filePath)) {
      fs.unlinkSync(note.filePath);
    }

    // Delete from database
    await Note.findByIdAndDelete(noteId);

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Failed to delete note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;