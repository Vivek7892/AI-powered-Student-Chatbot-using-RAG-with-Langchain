const mongoose = require('mongoose');

const mcqTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  semester: { type: String, required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }
  }],
  timeLimit: { type: Number, default: 30 }, // minutes
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('MCQTest', mcqTestSchema);