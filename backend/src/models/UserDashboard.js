const mongoose = require('mongoose');

const userDashboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  personalizedContent: {
    welcomeMessage: { type: String, default: 'Welcome to your AI Learning Journey!' },
    learningGoals: [{ type: String }],
    preferredSubjects: [{ type: String }],
    studyStreak: { type: Number, default: 0 },
    totalStudyHours: { type: Number, default: 0 },
    achievements: [{
      title: String,
      description: String,
      earnedAt: { type: Date, default: Date.now },
      icon: String
    }]
  },
  stats: {
    documentsUploaded: { type: Number, default: 0 },
    chatSessions: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 },
    studyPlansCreated: { type: Number, default: 0 }
  },
  quickActions: [{
    title: String,
    description: String,
    icon: String,
    route: String,
    isActive: { type: Boolean, default: true }
  }],
  recentActivity: [{
    type: { type: String, enum: ['chat', 'quiz', 'document', 'plan'] },
    title: String,
    description: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('UserDashboard', userDashboardSchema);