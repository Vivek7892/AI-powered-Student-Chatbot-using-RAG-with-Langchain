const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();

router.post('/session', chatController.createSession);
router.post('/message', chatController.sendMessage);
router.get('/history/:userId', chatController.getChatHistory);
router.get('/session/:sessionId', chatController.getSession);
router.post('/quiz', chatController.generateQuiz);
router.post('/study-plan', chatController.generateStudyPlan);

module.exports = router;