const User = require('../models/User');

// Получение профиля пользователя
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          phone: user.phone,
          avatar: user.avatar,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen
        }
      }
    });
  } catch (error) {
    console.error('❌ Ошибка при получении профиля:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить профиль'
    });
  }
};

// Обновление профиля пользователя
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    // Проверяем, не занято ли имя пользователя
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Это имя пользователя уже занято'
        });
      }
    }

    // Обновляем профиль
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { username } },
      { new: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: 'Профиль успешно обновлен',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          isOnline: updatedUser.isOnline,
          lastSeen: updatedUser.lastSeen
        }
      }
    });
  } catch (error) {
    console.error('❌ Ошибка при обновлении профиля:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить профиль'
    });
  }
};

// Изменение пароля
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Проверяем наличие всех полей
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Необходимо указать текущий и новый пароль'
      });
    }

    // Получаем пользователя с паролем
    const user = await User.findById(req.user.id);

    // Проверяем текущий пароль
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный текущий пароль'
      });
    }

    // Обновляем пароль
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    console.error('❌ Ошибка при изменении пароля:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось изменить пароль'
    });
  }
};

// Обновление статуса
const updateStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;

    // Обновляем статус и время последнего посещения
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          isOnline,
          lastSeen: isOnline ? null : new Date()
        } 
      },
      { new: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: 'Статус успешно обновлен',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          isOnline: updatedUser.isOnline,
          lastSeen: updatedUser.lastSeen
        }
      }
    });
  } catch (error) {
    console.error('❌ Ошибка при обновлении статуса:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить статус'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  updateStatus
}; 