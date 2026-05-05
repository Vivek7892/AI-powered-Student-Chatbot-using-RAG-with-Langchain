const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const { upload, uploadToCloudinary, cloudinary } = require('../config/cloudinary');

const router = express.Router();

// Upload note — auth required, file stored in Cloudinary
router.post('/upload', auth, upload.single('note'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Note name is required' });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    const note = new Note({
      userId: req.user._id,
      name: name.trim(),
      fileName: req.file.originalname,
      filePath: result.secure_url,   // store Cloudinary URL
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      cloudinaryId: result.public_id
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

// Get notes for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notes.map(note => ({
      id: note._id,
      name: note.name,
      fileName: note.fileName,
      size: note.fileSize,
      uploadDate: note.createdAt,
      mimeType: note.mimeType,
      url: note.filePath
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Keep legacy userId param route for backward compat
router.get('/:userId', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notes.map(note => ({
      id: note._id,
      name: note.name,
      fileName: note.fileName,
      size: note.fileSize,
      uploadDate: note.createdAt,
      mimeType: note.mimeType,
      url: note.filePath
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Delete note
router.delete('/:noteId', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (note.cloudinaryId) {
      try { await cloudinary.uploader.destroy(note.cloudinaryId); } catch (_) {}
    }

    await Note.findByIdAndDelete(req.params.noteId);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
