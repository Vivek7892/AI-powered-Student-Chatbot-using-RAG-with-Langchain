const express = require('express');
const documentController = require('../controllers/documentController');
const router = express.Router();

router.post('/upload', documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.delete('/:documentId', documentController.deleteDocument);
router.get('/content/:documentId', documentController.getDocumentContent);

module.exports = router;