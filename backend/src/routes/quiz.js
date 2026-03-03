const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Quiz generation route
router.post('/generate', chatController.generateQuiz);

// Get quiz by ID
router.get('/:quizId', (req, res) => {
  res.json({ message: 'Quiz retrieval - Coming soon' });
});

// Submit quiz answers
router.post('/:quizId/submit', (req, res) => {
  res.json({ message: 'Quiz submission - Coming soon' });
});

module.exports = router;