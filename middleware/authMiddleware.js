const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const authMiddleware = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Требуется авторизация'
      });
    }

    const token = authHeader.split(' ')[1];

    // Проверяем токен
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Получаем пользователя
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Пользователь не найден'
      });
    }

    // Добавляем пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Ошибка аутентификации:', error);
    res.status(401).json({
      status: 'error',
      message: 'Недействительный токен'
    });
  }
};

module.exports = authMiddleware;