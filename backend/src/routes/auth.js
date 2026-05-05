const express = require('express');
const auth = require('../middleware/auth');
const { getCurrentUser } = require('../controllers/authController');

const router = express.Router();

router.get('/me', auth, getCurrentUser);

module.exports = router;
