const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// Настройка хранилища для multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.upload.avatarPath);
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла: userId-timestamp.расширение
        const uniqueSuffix = `${req.user.id}-${Date.now()}`;
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый тип файла'), false);
    }
};

// Создаем middleware для загрузки
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.upload.maxSize
    }
});

// Middleware обработки ошибок multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: `Размер файла превышает ${config.upload.maxSize / (1024 * 1024)}MB`
            });
        }
        return res.status(400).json({
            status: 'error',
            message: 'Ошибка при загрузке файла'
        });
    }
    
    if (err.message === 'Неподдерживаемый тип файла') {
        return res.status(400).json({
            status: 'error',
            message: `Поддерживаются только форматы: ${config.upload.allowedTypes.join(', ')}`
        });
    }

    next(err);
};

module.exports = {
    upload,
    handleUploadError
}; 