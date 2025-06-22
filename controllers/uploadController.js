const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// @desc    Загрузка аватара
// @route   POST /api/upload/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'Файл не был загружен'
            });
        }

        // Получаем путь к файлу относительно сервера
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Если у пользователя уже есть аватар, удаляем старый файл
        const user = await User.findById(req.user.id);
        if (user.avatar) {
            const oldAvatarPath = path.join(__dirname, '..', user.avatar);
            try {
                await fs.unlink(oldAvatarPath);
            } catch (unlinkError) {
                console.warn('⚠️ Не удалось удалить старый аватар:', unlinkError.message);
            }
        }

        // Обновляем путь к аватару в базе данных
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { avatar: avatarUrl } },
            { new: true }
        ).select('-password');

        res.json({
            status: 'success',
            message: 'Аватар успешно загружен',
            data: {
                user: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    avatar: updatedUser.avatar
                }
            }
        });
    } catch (error) {
        console.error('❌ Ошибка при загрузке аватара:', error);
        res.status(500).json({
            status: 'error',
            message: 'Не удалось загрузить аватар'
        });
    }
};

module.exports = {
    uploadAvatar
}; 