const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'short_answer'], required: true },
  question: { type: String, required: true },
  options: [String], // for MCQ
  correctAnswer: { type: String, required: true },
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

const attemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true },
  score: { type: Number, required: true },
  answers: [String],
  completedAt: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  title: { type: String, required: true },
  questions: [questionSchema],
  attempts: [attemptSchema]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);