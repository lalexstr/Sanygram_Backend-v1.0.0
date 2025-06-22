const User = require('../models/User');
const Token = require('../models/Token');
const generateTokens = require('../utils/generateTokens');
const smsService = require('../utils/smsService');
const jwt = require('jsonwebtoken');

// Хранилище кодов верификации (в памяти для разработки)
const verificationCodes = new Map();

// Генерация случайного кода
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Начало регистрации
const startRegistration = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Номер телефона обязателен'
      });
    }

    // Проверяем, не зарегистрирован ли уже телефон
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Этот номер телефона уже зарегистрирован'
      });
    }

    // Генерируем код верификации
    const verificationCode = generateVerificationCode();
    
    // Сохраняем код в памяти
    verificationCodes.set(phone, {
      code: verificationCode,
      timestamp: Date.now()
    });

    // Отправляем SMS с кодом
    await smsService.sendSms(
      phone,
      `Ваш код подтверждения для Sanygram: ${verificationCode}`
    );

    res.json({
      status: 'success',
      message: 'Код подтверждения отправлен'
    });
  } catch (error) {
    console.error('❌ Ошибка при начале регистрации:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось начать регистрацию'
    });
  }
};

// Завершение регистрации
const completeRegistration = async (req, res) => {
  try {
    const { phone, code, username, password } = req.body;

    // Проверяем наличие всех полей
    if (!phone || !code || !username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Все поля обязательны'
      });
    }

    // Проверяем код верификации
    const storedData = verificationCodes.get(phone);
    if (!storedData || storedData.code !== code) {
      return res.status(400).json({
        status: 'error',
        message: 'Неверный код подтверждения'
      });
    }

    // Проверяем время действия кода (15 минут)
    if (Date.now() - storedData.timestamp > 15 * 60 * 1000) {
      verificationCodes.delete(phone);
      return res.status(400).json({
        status: 'error',
        message: 'Код подтверждения истек'
      });
    }

    // Проверяем уникальность username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        status: 'error',
        message: 'Это имя пользователя уже занято'
      });
    }

    // Создаем нового пользователя
    const user = new User({
      phone,
      username,
      password // Пароль будет захеширован через mongoose middleware
    });

    await user.save();
    
    // Удаляем использованный код
    verificationCodes.delete(phone);

    // Генерируем токены
    const tokens = await generateTokens(user._id);

    res.json({
      status: 'success',
      message: 'Регистрация успешно завершена',
      data: {
        user: {
          id: user._id,
          username: user.username,
          phone: user.phone
        },
        ...tokens
      }
    });
  } catch (error) {
    console.error('❌ Ошибка при завершении регистрации:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось завершить регистрацию'
    });
  }
};

// Вход в систему
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверяем наличие всех полей
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Все поля обязательны'
      });
    }

    // Ищем пользователя
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверное имя пользователя или пароль'
      });
    }

    // Проверяем пароль
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверное имя пользователя или пароль'
      });
    }

    // Генерируем новые токены
    const tokens = await generateTokens(user._id);

    // Обновляем статус онлайн
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    res.json({
      status: 'success',
      message: 'Вход выполнен успешно',
      data: {
        user: {
          id: user._id,
          username: user.username,
          phone: user.phone,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen
        },
        ...tokens
      }
    });
  } catch (error) {
    console.error('❌ Ошибка при входе:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось выполнить вход'
    });
  }
};

// Обновление токена
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token обязателен'
      });
    }

    // Проверяем существование токена в базе
    const tokenDoc = await Token.findOne({ token: refreshToken });
    if (!tokenDoc) {
      return res.status(401).json({
        status: 'error',
        message: 'Недействительный refresh token'
      });
    }

    // Генерируем новые токены
    const tokens = await generateTokens(tokenDoc.userId);

    res.json({
      status: 'success',
      message: 'Токены успешно обновлены',
      data: tokens
    });
  } catch (error) {
    console.error('❌ Ошибка при обновлении токена:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить токены'
    });
  }
};

// Выход из системы
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token обязателен'
      });
    }

    // Удаляем refresh token из базы
    await Token.deleteOne({ token: refreshToken });

    // Обновляем статус пользователя
    const user = await User.findById(req.user.id);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();
    }

    res.json({
      status: 'success',
      message: 'Выход выполнен успешно'
    });
  } catch (error) {
    console.error('❌ Ошибка при выходе:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось выполнить выход'
    });
  }
};

module.exports = {
  startRegistration,
  completeRegistration,
  login,
  refresh,
  logout
}; 