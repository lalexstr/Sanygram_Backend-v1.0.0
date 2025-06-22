const config = require('../config/config');

class SmsService {
  constructor() {
    this.isDevelopment = config.nodeEnv === 'development';
    
    if (!this.isDevelopment) {
      // В продакшене используем реальный Twilio клиент
      const twilio = require('twilio');
      this.client = new twilio(config.twilio.accountSid, config.twilio.authToken);
    }
  }

  async sendSms(to, message) {
    if (this.isDevelopment) {
      // В режиме разработки просто выводим код в консоль
      console.log('\n📱 SMS Verification (Development Mode)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📞 Получатель: ${to}`);
      console.log(`📝 Сообщение: ${message}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return {
        status: 'success',
        message: 'SMS код отправлен (режим разработки)'
      };
    }

    try {
      // В продакшене отправляем реальное SMS
      const result = await this.client.messages.create({
        body: message,
        to: to,
        from: config.twilio.phoneNumber
      });

      return {
        status: 'success',
        message: 'SMS успешно отправлено',
        sid: result.sid
      };
    } catch (error) {
      console.error('❌ Ошибка отправки SMS:', error);
      throw new Error('Не удалось отправить SMS');
    }
  }
}

module.exports = new SmsService(); 