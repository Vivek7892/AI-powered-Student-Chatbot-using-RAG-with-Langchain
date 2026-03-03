const express = require('express');
const { getDashboard, updateDashboardStats, addActivity } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getDashboard);
router.post('/stats', auth, updateDashboardStats);
router.post('/activity', auth, addActivity);

module.exports = router;