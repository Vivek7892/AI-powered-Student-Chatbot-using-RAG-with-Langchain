const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  semester: { type: String, required: true },
  imageUrl: String,
  imagePath: String,
  schedule: [[String]], // 2D array for custom timetable
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);