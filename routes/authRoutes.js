const express = require('express');
const router = express.Router();
const {
  startRegistration,
  completeRegistration,
  login,
  refresh,
  logout
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Публичные маршруты
router.post('/register/start', startRegistration);
router.post('/register/complete', completeRegistration);
router.post('/login', login);
router.post('/refresh', refresh);

// Защищенные маршруты (требуют аутентификации)
router.post('/logout', authMiddleware, logout);

module.exports = router; 