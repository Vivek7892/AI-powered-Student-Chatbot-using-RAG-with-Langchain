const Document = require('../models/Document');
const UserDashboard = require('../models/UserDashboard');
const { cloudinary, upload, uploadToCloudinary } = require('../config/cloudinary');
const ragService = require('../langchain/ragService');
const path = require('path');

class DocumentController {
  cleanExtractedText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async uploadDocument(req, res) {
    try {
      const userId = req.user._id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileType = path.extname(file.originalname).slice(1).toLowerCase();

      // 1. Extract text from buffer BEFORE uploading to Cloudinary
      let extractedContent = '';
      let processingStatus = 'failed';

      try {
        extractedContent = await ragService.extractTextFromFile(file.buffer, fileType);
        extractedContent = this.cleanExtractedText(extractedContent);
        processingStatus = extractedContent.length > 50 ? 'success' : 'partial';
        console.log(`Extracted ${extractedContent.length} chars from ${file.originalname}`);
      } catch (error) {
        console.error('Content extraction failed:', error.message);
        extractedContent = '';
        processingStatus = 'failed';
      }

      // 2. Upload buffer to Cloudinary
      let cloudinaryUrl = '';
      let cloudinaryId = '';
      try {
        const result = await uploadToCloudinary(file.buffer, file.originalname);
        cloudinaryUrl = result.secure_url;
        cloudinaryId = result.public_id;
      } catch (error) {
        console.error('Cloudinary upload failed:', error.message);
        return res.status(500).json({ error: 'File upload to storage failed' });
      }

      // 3. Save document with extracted content
      const document = new Document({
        userId,
        fileName: file.originalname,
        fileType,
        s3Url: cloudinaryUrl,
        s3Key: cloudinaryId,
        fileSize: file.size,
        content: extractedContent,
        processed: processingStatus === 'success',
        vectorEmbeddings: {
          chunkCount: Math.ceil((extractedContent.length || 0) / 1000)
        },
        metadata: {
          processingStatus,
          contentLength: extractedContent.length,
          extractedAt: new Date()
        }
      });

      await document.save();

      // 4. Pre-cache chunks in RAG service for fast querying
      if (extractedContent.length > 50) {
        ragService.ensureDocumentChunks(String(document._id), extractedContent, file.originalname)
          .catch((err) => console.error('Chunk caching failed:', err.message));
      }

      // 5. Update dashboard stats
      try {
        await UserDashboard.findOneAndUpdate(
          { userId },
          {
            $inc: { 'stats.documentsUploaded': 1 },
            $push: {
              recentActivity: {
                $each: [{
                  type: 'document',
                  title: `Uploaded "${file.originalname}"`,
                  description: `Document processed with ${processingStatus} status`,
                  timestamp: new Date()
                }],
                $position: 0,
                $slice: 10
              }
            }
          },
          { upsert: true, new: true }
        );
      } catch (dashError) {
        console.error('Failed to update dashboard stats:', dashError.message);
      }

      res.json({
        documentId: document._id,
        fileName: document.fileName,
        processed: document.processed,
        processingStatus,
        contentLength: extractedContent.length,
        chunksCreated: document.vectorEmbeddings.chunkCount,
        message: processingStatus === 'success'
          ? 'Document uploaded and processed successfully. You can now ask questions about it!'
          : processingStatus === 'partial'
          ? 'Document uploaded but content extraction was limited.'
          : 'Document uploaded but content extraction failed. Please try re-uploading.'
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getDocuments(req, res) {
    try {
      const userId = req.user._id;
      const documents = await Document.find({ userId }).sort({ createdAt: -1 });
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;
      const document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      try {
        await cloudinary.uploader.destroy(document.s3Key);
      } catch (err) {
        console.error('Cloudinary delete failed:', err.message);
      }

      await Document.findByIdAndDelete(documentId);
      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDocumentContent(req, res) {
    try {
      const { documentId } = req.params;
      const document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({ url: document.s3Url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

const documentController = new DocumentController();
const auth = require('../middleware/auth');

module.exports = {
  uploadDocument: [auth, upload.single('document'), documentController.uploadDocument.bind(documentController)],
  getDocuments: [auth, documentController.getDocuments.bind(documentController)],
  deleteDocument: [auth, documentController.deleteDocument.bind(documentController)],
  getDocumentContent: [auth, documentController.getDocumentContent.bind(documentController)]
};
