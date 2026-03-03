const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  language: { type: String, default: 'en' },
  voiceEnabled: { type: Boolean, default: false },
  context: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  messages: [messageSchema],
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
