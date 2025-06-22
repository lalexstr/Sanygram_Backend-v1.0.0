const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Token = require('../models/Token');

const generateTokens = async (userId) => {
  try {
    // Генерируем access token
    const accessToken = jwt.sign(
      { userId },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    // Генерируем refresh token
    const refreshToken = jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Сохраняем refresh token в базе данных
    await Token.findOneAndUpdate(
      { userId },
      { token: refreshToken },
      { upsert: true, new: true }
    );

    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('❌ Ошибка при генерации токенов:', error);
    throw error;
  }
};

module.exports = generateTokens;
