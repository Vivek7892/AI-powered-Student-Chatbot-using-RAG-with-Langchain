const mongoose = require('mongoose');

const adminNoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  semester: { type: String, required: true },
  fileName: String,
  filePath: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('AdminNote', adminNoteSchema);