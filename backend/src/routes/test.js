const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Test document content extraction
router.get('/document/:documentId', testController.testDocumentContent);

// Test document query
router.post('/query', testController.testQuery);

// Test quiz generation
router.post('/quiz', testController.testQuizGeneration);

module.exports = router;