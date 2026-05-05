const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx', 'doc', 'ppt', 'pptx', 'txt'], required: true },
  s3Url: { type: String, required: true },
  s3Key: { type: String, required: true },
  fileSize: Number,
  content: { type: String },
  processed: { type: Boolean, default: false },
  vectorEmbeddings: {
    openSearchIndex: String,
    chunkCount: { type: Number, default: 0 }
  },
  metadata: {
    title: String,
    subject: String,
    tags: [String],
    processingStatus: { type: String, enum: ['success', 'partial', 'failed'], default: 'failed' },
    contentLength: { type: Number, default: 0 },
    extractedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
