const Document = require('../models/Document');
const UserDashboard = require('../models/UserDashboard');
const { cloudinary, upload } = require('../config/cloudinary');
const ragService = require('../langchain/ragService');
const path = require('path');
const fs = require('fs');

class DocumentController {
  cleanExtractedText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }
  
  async uploadDocument(req, res) {
    try {
      console.log('Upload request received:', {
        body: req.body,
        file: req.file ? { originalname: req.file.originalname, size: req.file.size } : null
      });
      
      const userId = req.user._id; // Use authenticated user ID
      const file = req.file;

      if (!file) {
        console.log('No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // File is already uploaded to Cloudinary by multer
      const cloudinaryUrl = file.path;
      const cloudinaryId = file.filename;

      // Extract content with enhanced processing
      let extractedContent = '';
      let processingStatus = 'failed';
      
      try {
        console.log('Extracting content from file:', file.originalname);
        const fileType = path.extname(file.originalname).slice(1).toLowerCase();
        extractedContent = await ragService.extractTextFromFile(file.path, fileType);
        
        // Clean and validate extracted content
        extractedContent = this.cleanExtractedText(extractedContent);
        
        console.log('Content extracted and cleaned, length:', extractedContent.length);
        
        if (extractedContent.length > 50) {
          processingStatus = 'success';
          
          // Process content for better retrieval
          await ragService.processDocumentContent(extractedContent, 'temp-id');
        } else {
          console.warn('Extracted content too short, may indicate extraction issues');
          processingStatus = 'partial';
        }
      } catch (error) {
        console.error('Content extraction failed:', error);
        extractedContent = `Content extraction failed for ${file.originalname}. Please try re-uploading or use a different file format.`;
        processingStatus = 'failed';
      }

      // Save document with enhanced metadata
      const document = new Document({
        userId,
        fileName: file.originalname,
        fileType: path.extname(file.originalname).slice(1).toLowerCase(),
        s3Url: cloudinaryUrl,
        s3Key: cloudinaryId,
        fileSize: file.size,
        content: extractedContent,
        processed: processingStatus === 'success',
        vectorEmbeddings: {
          chunkCount: Math.ceil(extractedContent.length / 1000)
        },
        metadata: {
          processingStatus,
          contentLength: extractedContent.length,
          extractedAt: new Date()
        }
      });

      await document.save();
      
      // Update dashboard stats
      try {
        await UserDashboard.findOneAndUpdate(
          { userId },
          { 
            $inc: { 'stats.documentsUploaded': 1 },
            $push: { 
              'recentActivity': { 
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
        console.log('Dashboard stats updated for document upload');
      } catch (dashError) {
        console.error('Failed to update dashboard stats:', dashError);
      }
      
      console.log('Document saved:', {
        id: document._id,
        fileName: document.fileName,
        contentLength: extractedContent.length,
        processed: document.processed,
        status: processingStatus
      });



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
          ? 'Document uploaded but content extraction was limited. Some features may not work optimally.'
          : 'Document uploaded but content extraction failed. Please try re-uploading.'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDocuments(req, res) {
    try {
      const userId = req.user._id; // Use authenticated user ID
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

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(document.s3Key);

      // Delete from database
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

// Export with multer middleware and auth
module.exports = {
  uploadDocument: [auth, upload.single('document'), documentController.uploadDocument.bind(documentController)],
  getDocuments: [auth, documentController.getDocuments.bind(documentController)],
  deleteDocument: [auth, documentController.deleteDocument.bind(documentController)],
  getDocumentContent: [auth, documentController.getDocumentContent.bind(documentController)]
};