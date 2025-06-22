require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

// Обязательные переменные окружения
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

// Добавляем Twilio переменные только для production
if (nodeEnv === 'production') {
  requiredEnvVars.push(
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
  );
}

// Проверяем наличие всех обязательных переменных окружения
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`❌ Отсутствует обязательная переменная окружения: ${envVar}`);
  }
}

const config = {
  nodeEnv,
  port: process.env.PORT || 5000,

  mongodb: {
    uri: process.env.MONGO_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || 'development',
    authToken: process.env.TWILIO_AUTH_TOKEN || 'development',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+12345678900'
  },

  upload: {
    avatarPath: 'uploads/avatars',
    maxSize: process.env.MAX_UPLOAD_SIZE || 5 * 1024 * 1024, // 5MB по умолчанию
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  }
};

module.exports = config; 