const mongoose = require('mongoose');

const importantNoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  semester: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  fileName: String,
  filePath: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ImportantNote', importantNoteSchema);