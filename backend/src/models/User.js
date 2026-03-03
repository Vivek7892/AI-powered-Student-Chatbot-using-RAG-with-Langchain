const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  semester: { 
    type: String, 
    required: true,
    enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8', '1st'],
    default: '1st'
  },
  oauthProvider: { type: String, enum: ['google', 'github', null], default: null },
  oauthId: { type: String },
  dateOfBirth: Date,
  resumeUrl: String,
  preferences: {
    language: { type: String, default: 'en' },
    voiceEnabled: { type: Boolean, default: false },
    studyReminders: { type: Boolean, default: true },
    dailyHours: { type: Number, default: 2 },
    preferredTimes: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
