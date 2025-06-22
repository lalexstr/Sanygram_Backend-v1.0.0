const express = require('express');
const router = express.Router();
const { uploadAvatar } = require('../controllers/uploadController');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Загрузка аватара
router.post('/avatar', upload.single('avatar'), handleUploadError, uploadAvatar);

module.exports = router; 