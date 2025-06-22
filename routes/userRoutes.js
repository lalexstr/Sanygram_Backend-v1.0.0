const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePassword,
  updateStatus
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Профиль пользователя
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Изменение пароля
router.put('/password', updatePassword);

// Управление статусом
router.put('/status', updateStatus);

module.exports = router; 