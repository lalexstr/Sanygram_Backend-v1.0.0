const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB()
  .then(() => console.log('✅ MongoDB подключена'))
  .catch((err) => console.log('❌ Ошибка подключения к MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sanygram API' });
});

// Создаем папку для загрузок, если её нет
const fs = require('fs');
const uploadDir = path.join(__dirname, config.upload.avatarPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Start server
app.listen(config.port, () => {
  console.log('\n🚀 Сервер запущен');
  console.log(`🔹 Порт: ${config.port}`);
  console.log(`🔹 Режим: ${config.nodeEnv}\n`);

  console.log('📡 Эндпоинты аутентификации:');
  console.log(`🔹 POST http://localhost:${config.port}/api/auth/register/start - Начало регистрации`);
  console.log(`🔹 POST http://localhost:${config.port}/api/auth/register/complete - Завершение регистрации`);
  console.log(`🔹 POST http://localhost:${config.port}/api/auth/login - Вход в систему`);
  console.log(`🔹 POST http://localhost:${config.port}/api/auth/refresh - Обновление токена`);
  console.log(`🔹 POST http://localhost:${config.port}/api/auth/logout - Выход из системы\n`);
  
  console.log('📡 Эндпоинты профиля:');
  console.log(`🔹 GET  http://localhost:${config.port}/api/users/profile - Получить профиль`);
  console.log(`🔹 PUT  http://localhost:${config.port}/api/users/profile - Обновить профиль`);
  console.log(`🔹 PUT  http://localhost:${config.port}/api/users/password - Изменить пароль`);
  console.log(`🔹 PUT  http://localhost:${config.port}/api/users/status - Обновить статус`);
  console.log(`🔹 POST http://localhost:${config.port}/api/upload/avatar - Загрузить аватар\n`);

  console.log('📝 Документация по использованию:');
  console.log('1. Регистрация:');
  console.log('   a) Отправьте номер телефона на /register/start');
  console.log('   b) Получите код подтверждения');
  console.log('   c) Отправьте код, имя пользователя и пароль на /register/complete');
  console.log('2. Используйте полученный токен в заголовке Authorization: Bearer <token>\n');
}); 