const Document = require('../models/Document');
const ragService = require('../langchain/ragService');

class TestController {
  async testDocumentContent(req, res) {
    try {
      const { documentId } = req.params;
      
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      const contentPreview = document.content ? document.content.substring(0, 500) : 'No content';
      
      res.json({
        documentId: document._id,
        fileName: document.fileName,
        fileType: document.fileType,
        processed: document.processed,
        contentLength: document.content ? document.content.length : 0,
        contentPreview,
        metadata: document.metadata
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async testQuery(req, res) {
    try {
      const { documentId, question } = req.body;
      
      if (!documentId || !question) {
        return res.status(400).json({ error: 'Document ID and question are required' });
      }
      
      console.log('Testing query:', { documentId, question });
      
      const result = await ragService.queryDocument(question, documentId);
      
      res.json({
        question,
        documentId,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Test query error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async testQuizGeneration(req, res) {
    try {
      const { documentId, numQuestions = 3 } = req.body;
      
      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required' });
      }
      
      console.log('Testing quiz generation:', { documentId, numQuestions });
      
      const quiz = await ragService.generateQuiz(documentId, numQuestions);
      
      res.json({
        documentId,
        numQuestions: quiz.length,
        quiz,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Test quiz generation error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const testController = new TestController();

module.exports = {
  testDocumentContent: testController.testDocumentContent.bind(testController),
  testQuery: testController.testQuery.bind(testController),
  testQuizGeneration: testController.testQuizGeneration.bind(testController)
};