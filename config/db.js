const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('\n📦 База данных:');
    console.log(`🔹 Хост: ${conn.connection.host}`);
    console.log(`🔹 База: ${conn.connection.name}`);
    console.log(`🔹 Порт: ${conn.connection.port || 'по умолчанию'}\n`);
    return conn;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 